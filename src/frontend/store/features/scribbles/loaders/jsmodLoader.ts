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
import { transform } from '@babel/standalone';
import { useDispatch, useSelector } from 'react-redux';
import equals from 'deep-equal';
import createCachedSelector from 're-reselect';
import { ulid } from 'ulid';
import { createSelector } from '@reduxjs/toolkit';

import { Scribble, SyncedScribble } from '../scribble';
import {
  fetchScribble,
  selectScribbleById,
  selectAllScribbles,
  removeScribble,
  updateScribbleBody,
  updateScribbleAttributes,
  removeScribbleAttributes,
  commitDraft,
  createDraftScribble,
  syncScribble,
  resetSyncError,
} from '../scribblesSlice';
import { selectScribbleByTitle, selectLastSyncError } from '../selectors';
import { loadScribbleComponent, useScribble, UseScribbleContext } from '../useScribble';
import { selectScribblesByTag } from '../tagging';
import { ScribbleResolverContext } from '../ScribbleResolverContext';

const coreLocals = {
  createCachedSelector,
  createSelector,
  useSelector,
  useDispatch,
  selectScribbleById,
  selectScribbleByTitle,
  selectScribblesByTag,
  selectAllScribbles,
  useScribble,
  fetchScribble,
  removeScribble,
  updateScribbleBody,
  updateScribbleAttributes,
  removeScribbleAttributes,
  commitDraft,
  equals,
  loadScribbleComponent,
  UseScribbleContext,
  ScribbleResolverContext,
  createDraftScribble,
  ulid,
  syncScribble,
  resetSyncError,
  selectLastSyncError,
};
const exportedLocals = { React, core: coreLocals };
const localKeys = Object.keys(exportedLocals) as (keyof typeof exportedLocals)[];
const localValues = localKeys.map((k) => exportedLocals[k]);

class ScribbleEvaluationError extends Error {
  constructor(public readonly scribble: Scribble, public readonly parentError: Error) {
    super(`failed to evaluate scribble ${scribble.id}`
      + `${scribble.attributes.title ? ` '${scribble.attributes.title}'` : ''}: ${parentError}`);
  }
}

// eslint-disable-next-line import/prefer-default-export
export function loadJsModule(
  sc: SyncedScribble,
  components: { [key: string]: React.ComponentType },
): React.ComponentType {
  const modBody = transform(sc.body, { presets: ['env', 'react'] }).code;
  if (modBody === null || modBody === undefined) {
    throw Error('failed to transpile the body');
  }
  const exports = {} as { default: React.ComponentType };
  try {
    // eslint-disable-next-line no-new-func
    new Function('exports', 'components', ...localKeys, modBody)(exports, components, ...localValues);
  } catch (e) {
    throw new ScribbleEvaluationError(sc, e);
  }
  if (exports.default === undefined) {
    throw Error('the modeule does not define a default export');
  }
  return exports.default;
}
