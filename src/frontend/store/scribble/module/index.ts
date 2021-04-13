// Copyright 2020 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import { transform } from '@babel/standalone';

import { Scribble } from '../../interface/scribble';

/**
 * ScribbleEvaluationError is thrown if the scribble JS module fails to eval.
 */
class ScribbleEvaluationError extends Error {
  /**
   * Creates a new ScribbleEvaluationError.
   *
   * @param scribble The scribble that caused the eval failure.
   * @param parentError The original raised error.
   */
  constructor(public readonly scribble: Scribble, public readonly parentError: Error) {
    super(`failed to evaluate scribble ${scribble}: ${parentError}`);
  }
}

interface Exports {
  default?: unknown;
  [key: string]: unknown;
}

/**
 * Loads the JS module from a scribble. There's no caching so it's extremely slow.
 *
 * @param scribble A scribble with body.
 * @param locals Locals to pass to the scribble context.
 * @returns The exported default if set, all the exports otherwise.
 */
function loadModule<T>(
  scribble: Scribble,
  locals: { [key: string]: unknown },
): T {
  const { body } = scribble.latestStableVersion;
  if (body === null) {
    throw new ScribbleEvaluationError(scribble, Error('body is missing'));
  }
  const modBody = transform(body, { presets: ['env', 'react'] }).code;
  if (modBody === null || modBody === undefined) {
    throw Error('failed to transpile the body');
  }
  const exports = {} as Exports;

  const localKeys = Object.keys(locals);
  const localValues = localKeys.map((k) => locals[k]);

  try {
    // eslint-disable-next-line no-new-func
    new Function('exports', ...localKeys, modBody)(exports, ...localValues);
  } catch (e) {
    throw new ScribbleEvaluationError(scribble, e);
  }

  console.log(`loadModule("${scribble}")`);

  return (exports.default !== undefined ? exports.default : exports) as T;
}

export default loadModule;
