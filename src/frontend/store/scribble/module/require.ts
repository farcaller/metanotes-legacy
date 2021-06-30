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

import * as ParsimmonModule from 'parsimmon';
import * as ReactModule from 'react';
import * as ReactNativeModule from 'react-native';
import { observer } from 'mobx-react-lite';

import useEvalStore from '../eval/use_context';
import EvalStoreContext, { EvalStore } from '../eval/context';
import Pipeline, { evalCmdlet } from '../../../filter';
import ScribblesStoreInterface from './scribbles_store_interface';

/**
 * A require implementation for scribbles.
 *
 * @param mod Module to load.
 * @param store Store owning the scribble.
 * @returns Resolved module.
 * @throws Throws if module cannot be resolved.
 */
export default function scribbleRequire(mod: string, store: ScribblesStoreInterface): unknown {
  switch (mod) {
    case '@metascribbles/parsimmon':
      return ParsimmonModule;
    case '@metascribbles/react':
      return ReactModule;
    case '@metascribbles/react-native':
      return ReactNativeModule;
    case '@metascribbles/store':
      return {
        useStore: store.useStore,
        useEvalStore,
        observer,
        EvalStore,
        EvalStoreContext,
      };
    case '@metascribbles/filter':
      return {
        Pipeline,
        evalCmdlet,
      };
    default:
      return store.requireScribble(mod);
  }
}
