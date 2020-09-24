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

// TODO: chevrotain is extremely type unsafe
/* eslint-disable @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-return,@typescript-eslint/no-explicit-any */

import lexer from './lexer';
import parser from './parser';
import * as ast from './ast';
import builtinFuncations from './functions';


const getAst = (query: string) => {
  const lexingResult = lexer.tokenize(query);
  if (lexingResult.errors.length > 0) {
    throw new Error(`lexer failed: ${lexingResult.errors.join(', ')}`);
  }
  parser.input = lexingResult.tokens;
  const a = (parser as any).filter();
  if (parser.errors.length > 0) {
    throw new Error(`parser failed: ${parser.errors.join(', ')}`);
  }
  return a;
};

const runFunction = (call: ast.Call, input: any): any => {
  const fun = (builtinFuncations as any)[call.functionName];
  if (fun) {
    return fun(input, call.arguments);
  }
  return undefined;
};

const runPipeline = (pipeline: ast.Pipeline, dataset: any[]): any => {
  let pipe = dataset;
  for (const call of pipeline.calls) {
    pipe = runFunction(call, pipe);
  }
  return pipe;
};

const run = (query: string, dataset: any[]): any => {
  const a = getAst(query);
  return runPipeline(a, dataset);
};

export default run;
