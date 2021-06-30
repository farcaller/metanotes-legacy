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

import React from 'react';
import { transform, availablePlugins } from '@babel/standalone';

import { Scribble } from '../../interface/scribble';
import scribbleRequire from './require';
import ScribblesStoreInterface from './scribbles_store_interface';

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
 * @param store Scribble's owning store.
 * @returns The exported default if set, all the exports otherwise.
 */
function loadModule<T>(
  scribble: Scribble,
  store: ScribblesStoreInterface,
): T {
  const { latestStableVersion } = scribble;
  if (latestStableVersion === undefined) {
    throw new ScribbleEvaluationError(scribble, Error('no stable version'));
  }
  const { body } = latestStableVersion;
  if (body === null) {
    throw new ScribbleEvaluationError(scribble, Error('body is missing'));
  }
  let modBody;
  try {
    modBody = transform(body, {
      comments: false,
      compact: true,
      presets: ['env', 'react'],
      plugins: [
        [availablePlugins['transform-typescript'], { isTSX: true }],
      ],
    }).code;
  } catch (e) {
    throw Error(`failed to transpile the body: ${e}`);
  }
  if (modBody === null || modBody === undefined) {
    throw Error('failed to transpile the body');
  }
  const exports = {} as Exports;

  const storeRequire = (mod: string) => scribbleRequire(mod, scribble, store);

  try {
    // eslint-disable-next-line no-new-func
    new Function('exports', 'React', 'require', modBody)(exports, React, storeRequire);
  } catch (e) {
    throw new ScribbleEvaluationError(scribble, e);
  }

  if (process.env.NODE_ENV === 'development') {
    console.log(`loadModule("${scribble}")`);
  }

  return (exports.default !== undefined ? exports.default : exports) as T;
}

export default loadModule;
