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

import { RootState } from '../..';
import { Scribble } from './scribble';
import { scribblesAdapter, selectScribbleByTitle, updateTitleMapAdd } from './scribblesSlice';
import { selectScribblesByTag } from './tagging';


function makeState(scribbles: Scribble[]): RootState {
  const state: RootState = {
    scribbles: {
      status: 'idle',
      error: null,
      titleToIdMap: {},
      scribbles: scribblesAdapter.addMany(scribblesAdapter.getInitialState(), scribbles)
    }
  };

  updateTitleMapAdd(state.scribbles, scribbles);

  return state;
}

function makeScribble(id: string, title: string, attrs?: any): Scribble {
  return {
    id,
    status: 'core',
    attributes: {
      'content-type': '',
      title,
      ...attrs,
    }
  };
}

function getIDs(scribbles: Scribble[]): string[] {
  return scribbles.map(s => s.id);
}

test('it sorts tags by title', () => {
  const state = makeState([
    makeScribble('3', '3', { tags: 'hello' }),
    makeScribble('2', '2', { tags: 'hello' }),
    makeScribble('1', '1', { tags: 'hello' }),
  ]);

  const selection = selectScribblesByTag(state, 'hello');

  expect(getIDs(selection)).toEqual(['1', '2', '3']);
});

test('it includes the `list`-ed scribbles first', () => {
  const state = makeState([
    makeScribble('3', '3', { tags: 'hello' }),
    makeScribble('2', '2', { tags: 'hello' }),
    makeScribble('1', '1', { tags: 'hello' }),
    makeScribble('4', 'hello', { list: ['3'] }),
  ]);

  const selection = selectScribblesByTag(state, 'hello');

  expect(getIDs(selection)).toEqual(['3', '1', '2']);
});

test('it includes the untitled scribbles last', () => {
  const state = makeState([
    makeScribble('3', '3', { tags: 'hello' }),
    makeScribble('2', undefined, { tags: 'hello' }),
    makeScribble('1', '1', { tags: 'hello' }),
  ]);

  const selection = selectScribblesByTag(state, 'hello');

  expect(getIDs(selection)).toEqual(['1', '3', '2']);
});

test('it puts the scribble with and empty `list-before` first', () => {
  const state = makeState([
    makeScribble('3', '3', { tags: 'hello', 'list-before': '' }),
    makeScribble('2', '2', { tags: 'hello' }),
    makeScribble('1', '1', { tags: 'hello' }),
  ]);

  const selection = selectScribblesByTag(state, 'hello');

  expect(getIDs(selection)).toEqual(['3', '1', '2']);
});

test('it puts the scribble with and empty `list-after` last', () => {
  const state = makeState([
    makeScribble('3', '3', { tags: 'hello' }),
    makeScribble('2', '2', { tags: 'hello', 'list-after': '' }),
    makeScribble('1', '1', { tags: 'hello' }),
  ]);

  const selection = selectScribblesByTag(state, 'hello');

  expect(getIDs(selection)).toEqual(['1', '3', '2']);
});
