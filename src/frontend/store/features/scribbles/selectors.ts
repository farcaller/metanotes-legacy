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

import createCachedSelector from 're-reselect';

import { RootState } from '../..';
import { Scribble } from './scribble';
import { ScribblesState, selectScribbleById } from './scribblesSlice';


export const selectScribbles = (state: RootState): ScribblesState => state.scribbles;

const selectIDsByTitle = createCachedSelector(
  selectScribbles,
  (_: RootState, title: string) => title,
  (scribbles, title) => {
    const ids = scribbles.titleToIdMap[title];
    if (ids === undefined) {
      return [];
    }
    return ids;
  },
)((_, title) => title);

const selectTitlesByPrefix = createCachedSelector(
  selectScribbles,
  (_: RootState, prefix: string) => prefix,
  (scribbles, titlePrefix) => {
    const matchingTitles = Object.keys(scribbles.titleToIdMap).filter(t => t.startsWith(titlePrefix));
    const ids = matchingTitles.map(title => scribbles.titleToIdMap[title]);
    return ids;
  },
)((_, prefix) => prefix);

const selectScribbleByIDList = createCachedSelector(
  (state: RootState) => state,
  (_: RootState, ids: string[]) => ids,
  (state, ids) => {
    if (ids.length === 1) {
      const val = selectScribbleById(state, ids[0]);
      return val;
    }
    if (ids.length === 2) {
      const first = selectScribbleById(state, ids[0])!;
      const second = selectScribbleById(state, ids[1])!;
      if (first.status === 'core') {
        return second;
      } else if (second.status === 'core') {
        return first;
      } else {
        return undefined;
      }
    }
    return undefined;
  },
)((_, ids) => ids.join('-'));

export const selectScribbleByTitle = createCachedSelector(
  (state) => state,
  selectIDsByTitle,
  selectScribbleByIDList,
)((_, title) => title);

export const selectScribblesByTitlePrefix = createCachedSelector(
  (state) => state,
  selectTitlesByPrefix,
  (state: RootState, ids: string[][]) => {
    return ids.map(id => selectScribbleByIDList(state, id)).filter(Boolean) as Scribble[];
  },
)((_, prefix) => prefix);

export const selectLastSyncError = (state: RootState): string|null => state.scribbles.lastSyncError;
