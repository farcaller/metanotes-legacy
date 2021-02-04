/**
 * @license
 * Copyright 2020 The Bazel Authors. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 *
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const path = require('path');
const fs = require('fs');
const rollup = require('rollup');
const loadConfigFile = require('rollup/dist/loadConfigFile');
const crypto = require('crypto')

const MNEMONIC = 'Rollup';
const PID = process.pid;

const worker = {};
////////////// WORKER
// const path = require("path");
const protobufjs = require("protobufjs");
// Equivalent of running node with --expose-gc
// but easier to write tooling since we don't need to inject that arg to
// nodejs_binary
if (typeof global.gc !== 'function') {
  // tslint:disable-next-line:no-require-imports
  require('v8').setFlagsFromString('--expose_gc');
  // tslint:disable-next-line:no-require-imports
  global.gc = require('vm').runInNewContext('gc');
}
/**
 * Whether to print debug messages (to console.error) from the debug function
 * below.
 */

worker.DEBUG = false;
/** Maybe print a debug message (depending on a flag defaulting to false). */
function debug(...args) {
  if (worker.DEBUG)
    console.error.call(console, ...args);
}
worker.debug = debug;
/**
 * Write a message to stderr, which appears in the bazel log and is visible to
 * the end user.
 */
function log(...args) {
  console.error.call(console, ...args);
}
worker.log = log;
/**
 * runAsWorker returns true if the given arguments indicate the process should
 * run as a persistent worker.
 */
function runAsWorker(args) {
  return args.indexOf('--persistent_worker') !== -1;
}
worker.runAsWorker = runAsWorker;
/**
 * loadWorkerPb finds and loads the protocol buffer definition for bazel's
 * worker protocol using protobufjs. In protobufjs, this means it's a reflection
 * object that also contains properties for the individual messages.
 */
function loadWorkerPb() {
  const proto = `syntax = "proto3";

package blaze.worker;

option java_package = "com.google.devtools.build.lib.worker";

message Input {
  string path = 1;
  bytes digest = 2;
}

message WorkRequest {
  repeated string arguments = 1;
  repeated Input inputs = 2;
  int32 request_id = 3;
}

message WorkResponse {
  int32 exit_code = 1;
  string output = 2;
  int32 request_id = 3;
}
`;
  // const protoNamespace = new protobufjs.Root()
  const protoNamespace = protobufjs.parse(proto).root;
  if (!protoNamespace) {
    throw new Error('Cannot find ' + path.resolve(protoPath));
  }
  const workerpb = protoNamespace.lookup('blaze.worker');
  if (!workerpb) {
    throw new Error(`Cannot find namespace blaze.worker`);
  }
  return workerpb;
}
/**
 * workerpb contains the runtime representation of the worker protocol buffer,
 * including accessor for the defined messages.
 */
const workerpb = loadWorkerPb();
/**
 * runWorkerLoop handles the interacton between bazel workers and the
 * TypeScript compiler. It reads compilation requests from stdin, unmarshals the
 * data, and dispatches into `runOneBuild` for the actual compilation to happen.
 *
 * The compilation handler is parameterized so that this code can be used by
 * different compiler entry points (currently TypeScript compilation, Angular
 * compilation, and the contrib vulcanize worker).
 *
 * It's also exposed publicly as an npm package:
 *   https://www.npmjs.com/package/@bazel/worker
 */
async function runWorkerLoop(runOneBuild) {
  // Hook all output to stderr and write it to a buffer, then include
  // that buffer's in the worker protcol proto's textual output.  This
  // means you can log via console.error() and it will appear to the
  // user as expected.
  let consoleOutput = '';
  process.stderr.write =
    (chunk, ...otherArgs) => {
      consoleOutput += chunk.toString();
      return true;
    };
  // Accumulator for asynchronously read input.
  // protobufjs uses node's Buffer, but has its own reader abstraction on top of
  // it (for browser compatiblity). It ignores Buffer's builtin start and
  // offset, which means the handling code below cannot use Buffer in a
  // meaningful way (such as cycling data through it). The handler below reads
  // any data available on stdin, concatenating it into this buffer. It then
  // attempts to read a delimited Message from it. If a message is incomplete,
  // it exits and waits for more input. If a message has been read, it strips
  // its data of this buffer.
  let buf = Buffer.alloc(0);
  stdinLoop: for await (const chunk of process.stdin) {
    buf = Buffer.concat([buf, chunk]);
    try {
      const reader = new protobufjs.Reader(buf);
      // Read all requests that have accumulated in the buffer.
      while (reader.len - reader.pos > 0) {
        const messageStart = reader.len;
        const msgLength = reader.uint32();
        // chunk might be an incomplete read from stdin. If there are not enough
        // bytes for the next full message, wait for more input.
        if ((reader.len - reader.pos) < msgLength)
          continue stdinLoop;
        const req = workerpb.WorkRequest.decode(reader, msgLength);
        // Once a message has been read, remove it from buf so that if we pause
        // to read more input, this message will not be processed again.
        buf = buf.slice(messageStart);
        debug('=== Handling new build request');
        const args = req.arguments;
        const inputs = {};
        for (const input of req.inputs) {
          inputs[input.path] = input.digest.toString('hex');
        }
        debug('Compiling with:\n\t' + args.join('\n\t'));
        process.stdout.write(workerpb.WorkResponse.encodeDelimited({
          exitCode: await runOneBuild(args, inputs) ? 0 : 1,
          output: consoleOutput,
        }).finish());
        // Reset accumulated log output now that it has been printed.
        consoleOutput = '';
        // Force a garbage collection pass.  This keeps our memory usage
        // consistent across multiple compilations, and allows the file
        // cache to use the current memory usage as a guideline for expiring
        // data.  Note: this is intentionally not within runOneBuild(), as
        // we want to gc only after all its locals have gone out of scope.
        global.gc();
      }
      // All messages have been handled, make sure the invariant holds and
      // Buffer is empty once all messages have been read.
      if (buf.length > 0) {
        throw new Error('buffer not empty after reading all messages');
      }
    }
    catch (e) {
      log('Compilation failed', e.stack);
      process.stdout.write(workerpb.WorkResponse
        .encodeDelimited({ exitCode: 1, output: consoleOutput })
        .finish());
      // Clear buffer so the next build won't read an incomplete request.
      buf = Buffer.alloc(0);
    }
  }
}
worker.runWorkerLoop = runWorkerLoop;
////////////// END WORKER
// let worker = { runWorkerLoop };
// let worker = require('./worker');

// Store the cache forever to re-use on each build
let cacheMap = Object.create(null);

// Generate a unique cache ID based on the given json data
function computeCacheKey(cacheKeyData) {
  const hash = crypto.createHash('sha256');
  const hashContent = JSON.stringify(cacheKeyData);
  return hash.update(hashContent).digest('hex');
}

async function runRollup(cacheKeyData, inputOptions, outputOptions) {
  // worker.log('running rollup with', JSON.stringify(inputOptions, null, 2));
  try {
    await fs.promises.access('node_modules');
  } catch {
    // worker.log('need to re-link node_modules');
    await fs.promises.symlink('external/npm/node_modules', 'node_modules');
  }

  const cacheKey = computeCacheKey(cacheKeyData);

  let cache = cacheMap[cacheKey];

  const rollupStartTime = Date.now();

  const bundle = await rollup.rollup({ ...inputOptions, cache });

  const rollupEndTime = Date.now();
  worker.log(
    `${MNEMONIC}[${PID}][${cacheKey}].rollup()`, (rollupEndTime - rollupStartTime) / 1000);

  cacheMap[cacheKey] = bundle.cache;

  try {
    await bundle.write(outputOptions);
  } catch (e) {
    worker.log(e);
    return false;
  }

  const bundleEndTime = Date.now();
  worker.debug(`${MNEMONIC}[${PID}][${cacheKey}].write()`, (bundleEndTime - rollupEndTime) / 1000);

  return true;
}

// Run rollup, will use + re-populate the cache
// Essentially the same as the rollup CLI but using bazel APIs
// for CLI arguments and FS watching
// See: https://github.com/rollup/rollup/blob/v2.23.1/cli/run/index.ts#L11
async function runRollupBundler(args /*, inputs */) {
  const { inputOptions, outputOptions } = await parseCLIArgs(args);

  return runRollup(inputOptions.input, inputOptions, outputOptions);
}

// Processing of --environment CLI options into environment vars
// https://github.com/rollup/rollup/blob/v1.31.0/cli/run/index.ts#L50-L57
function extractEnvironmentVariables(vars) {
  vars.split(',').forEach(pair => {
    const [key, ...value] = pair.split(':');
    if (value.length) {
      process.env[key] = value.join(':');
    } else {
      process.env[key] = String(true);
    }
  });
}

// Parse a subset of supported CLI arguments required for the rollup_bundle rule API.
// Returns input/outputOptions for the rollup.bundle/write() API
//  input:  https://rollupjs.org/guide/en/#inputoptions-object
//  output: https://rollupjs.org/guide/en/#outputoptions-object
async function parseCLIArgs(args) {
  // Options which the CLI args or config file can override
  const defaultInputOptions = {
    onwarn(...warnArgs) {
      worker.log(...warnArgs);
    },
  };

  // Options which can override the config file
  let inputOptions = {};

  let outputOptions = {};

  let configFile = null;

  // Input files to rollup
  let inputs = [];

  // Followed by suppported rollup CLI options
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    // Non-option is assumed to be an input file
    if (!arg.startsWith('--')) {
      inputs.push(arg);
      continue;
    }

    const option = arg.slice(2);
    switch (option) {
      case 'config':
        configFile = path.resolve(args[++i]);
        break;

      case 'silent':
        inputOptions.onwarn = () => { };
        break;

      case 'format':
      case 'output.dir':
      case 'output.file':
      case 'sourcemap':
        outputOptions[option.replace('output.', '')] = args[++i];
        break;

      case 'preserveSymlinks':
        inputOptions[option] = true;
        break;

      // Common rollup CLI args, but not required for use
      case 'environment':
        extractEnvironmentVariables(args[++i]);
        break;

      default:
        throw new Error(`${MNEMONIC}: invalid or unsupported argument ${arg}`);
    }
  }

  // If outputting a directory then rollup_bundle.bzl passed a series
  // of name=path files as the input.
  // TODO: do some not have the =?
  if (outputOptions.dir) {
    inputs = inputs.reduce((m, nameInput) => {
      const [name, input] = nameInput.split('=', 2);
      m[name] = input;
      return m;
    }, {});
  }

  // Additional options passed via config file
  if (configFile) {
    const { options, warnings } = await loadConfigFile(configFile);

    // Flush any config file warnings to stderr
    warnings.flush();

    // Does NOT support (unlike rollup CLI):
    // * multiple configs for multiple outputs
    if (options.length !== 1) {
      throw new Error('Array configs unsupported');
    }

    const config = options[0];

    if (config.output) {
      outputOptions = { ...config.output[0], ...outputOptions };
    }

    inputOptions = { ...config, ...inputOptions };

    // Delete from our copied inputOptions, not the config which
    // may be external and persisted across runs
    delete inputOptions.output;
  }

  // Provide default inputOptions which can be overwritten
  inputOptions = { ...defaultInputOptions, ...inputOptions };

  // The inputs are the rule entry_point[s]
  inputOptions.input = inputs;

  return { inputOptions, outputOptions };
}

async function main(args) {
  // Bazel will pass a special argument to the program when it's running us as a worker
  if (worker.runAsWorker(args)) {
    worker.log(`Running ${MNEMONIC} as a Bazel worker [PATCHED]`);

    worker.runWorkerLoop(runRollupBundler);
  } else {
    // Running standalone so stdout is available as usual
    console.log(`Running ${MNEMONIC} as a standalone process`);
    console.error(
      `Started a new process to perform this action. Your build might be misconfigured, try
      --strategy=${MNEMONIC}=worker`);

    // Parse the options from the bazel-supplied options file.
    // The first argument to the program is prefixed with '@'
    // because Bazel does that for param files. Strip it first.
    const paramFile = process.argv[2].replace(/^@/, '');
    const args = require('fs').readFileSync(paramFile, 'utf-8').trim().split('\n');

    return (await runRollupBundler(args)) ? 0 : 1;
  }
}

if (require.main === module) {
  main(process.argv.slice(2)).then(r => (process.exitCode = r));
}
