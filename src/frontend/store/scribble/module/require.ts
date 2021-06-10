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

import { Scribble } from '../../interface/scribble';
import { ScribblesStore } from '../../interface/store';
import useStore from '../../context/use_context';

/**
 * A require implementation that tries to resolve the scribble.
 *
 * TODO: This might return undefined in scenarios that weren't anticipated.
 *
 * @param name Scribble name.
 * @param store Scribble owning store.
 * @returns Scribble's JSModule or undefined if that failed.
 */
function requireScribble(name: string, store: ScribblesStore): unknown | undefined {
  try {
    return store.requireScribble(name);
  } catch (e) {
    return undefined;
  }
}

/**
 * A require implementation for scribbles.
 *
 * @param mod Module to load.
 * @param _scribble Scribble originating the request.
 * @param store Store owning the scribble.
 * @returns Resolved module.
 * @throws Throws if module cannot be resolved.
 */
export default function scribbleRequire(mod: string, _scribble: Scribble, store: ScribblesStore): unknown {
  const scribble = requireScribble(mod, store);
  if (scribble !== undefined) {
    return scribble;
  }

  switch (mod) {
    case '@metascribbles/parsimmon':
      return ParsimmonModule;
    case '@metascribbles/react':
      return ReactModule;
    case '@metascribbles/react-native':
      return ReactNativeModule;
    case '@metascribbles/store':
      return {
        useStore,
        observer,
      };
    default:
      throw Error(`cannot require '${mod}': not found`);
  }
}
