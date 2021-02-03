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
import { createSelectorCreator, defaultMemoize } from 'reselect';
import equals from 'deep-equal';

import { RootState } from '../../index';
import { Scribble } from './scribble';
import { selectAllScribbles } from './scribblesSlice';
import { selectScribbleByTitle } from './selectors';


const createDeepEqualSelector = createSelectorCreator(
  defaultMemoize,
  (a, b) =>  equals(a, b),
);

const selectScribblesTagged = createCachedSelector(
  selectAllScribbles,
  (_: RootState, tag: string) => tag,
  (scribbles, tag) => {
    return scribbles.filter(scribble => {
      const tags = scribble.computedAttributes.tags;
      if (!tags) { return false; }
      if (tags.indexOf(tag) === -1) { return false; }
      return true;
    });
  }
)({
  keySelector: (_, tag) => tag,
  selectorCreator: createDeepEqualSelector,
});

export const selectScribblesByTag = createCachedSelector(
  selectScribblesTagged,
  selectScribbleByTitle,
  (matchingScribbles, tagScribble) => {
    // sorting is adopted from TW5 rules: https://tiddlywiki.com/static/Order%2520of%2520Tagged%2520Tiddlers.html
    // 1. Get the scribble named ${tag} and add all the results in the order of the scribble's `list` attribute
    // 2. Append all the remaining scribbles with non-empty `title` sorted alphabetically
    // 3. Append all the remaining scribbles sorted by ID (thus by creation date)
    // 4. Apply the following sorting rule to the resulting list. For evey scribble:
    //    4.1. If it has a `list-before` attirbute and it's empty, move it to the beginning
    //    4.2. If it has a `list-after` attribute and it's empty, move it to the end
    //    4.3. If it has a scribble reference in the `list-before`, reorder that scribble, then put this one before it
    //    4.4. If it has a scribble reference in the `list-after`, reorder that scribble, then put this one after it
    const listedScribbles = [];
    if (tagScribble) {
      // should it match by ID too?
      for (const title of tagScribble.computedAttributes.list) {
        const scribbleIdx = matchingScribbles.findIndex(s => s.attributes.title === title);
        if (scribbleIdx !== -1) {
          listedScribbles.push(matchingScribbles.splice(scribbleIdx, 1)[0]);
        }
      }
    }
    const {titledScribbles, restScribbles} = matchingScribbles.reduce((acc, scribble) => {
      if (scribble.attributes.title) {
        acc.titledScribbles.push(scribble);
      } else {
        acc.restScribbles.push(scribble);
      }
      return acc;
    }, { titledScribbles: [] as Scribble[], restScribbles: [] as Scribble[] });
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    titledScribbles.sort((a, b) => a.attributes.title!.localeCompare(b.attributes.title!));
    restScribbles.sort((a, b) => a.id.localeCompare(b.id));

    const result = listedScribbles.concat(titledScribbles).concat(restScribbles);

    const reordered = new Set();
    const reorder = (scribble?: Scribble) => {
      if (!scribble) { return; }

      if (reordered.has(scribble.id)) { return; }
      reordered.add(scribble.id);

      const before = scribble.attributes['list-before'];
      const after = scribble.attributes['list-after'];
      let idx;

      if (before === '') {
        idx = 0;
      } else if (after === '') {
        idx = result.length;
      } else if (before !== undefined) {
        const beforeScribble = result.find(s => s.attributes.title === before);
        if (beforeScribble !== undefined) {
          reorder(beforeScribble);
          idx = result.indexOf(beforeScribble);
        }
      } else if (after !== undefined) {
        const afterScribble = result.find(s => s.attributes.title === after);
        if (afterScribble !== undefined) {
          reorder(afterScribble);
          idx = result.indexOf(afterScribble) + 1;
        }        
      }
      
      if (idx !== undefined) {
        const currentIdx = result.indexOf(scribble);
        if (currentIdx !== idx) {
          result.splice(currentIdx, 1);
          if (currentIdx < idx) {
            --idx;
          }
          result.splice(idx, 0, scribble);
        }
      }
    };

    const immResult = result.slice(0);
    for (const s of immResult) {
      reorder(s);
    }

    return result;
  },
)({
  keySelector: (_, tag) => tag,
  selectorCreator: createDeepEqualSelector,
});
