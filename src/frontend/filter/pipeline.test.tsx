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

/* eslint-disable @typescript-eslint/no-non-null-assertion */

import React from 'react';
import { render } from '@testing-library/react-native';
import { observer } from 'mobx-react-lite';

import EvalStoreContext, { EvalStore } from '../store/scribble/eval/context';
import MockStore from '../store/mock_store';
import { ExternalStore } from '../store/provider';

const mockStore = MockStore();

function makeQuery(store: EvalStore, query: string) {
  function Element() {
    const scribble = mockStore.scribbleByTitle('$:core/widget/query')!;
    const QueryEl = scribble.JSModule as any;

    return (
      <ExternalStore store={mockStore as any}>
        <EvalStoreContext.Provider value={store}>
          <QueryEl query={query} bind="test" />
        </EvalStoreContext.Provider>
      </ExternalStore>
    );
  }
  const ElementObserver = observer(Element);
  return ElementObserver;
}

it('returns all scribbles for Get-Scribbles cmdlet', async () => {
  const evalStore = new EvalStore();
  const ElementObserver = makeQuery(evalStore, 'Get-Scribbles');
  await render(<ElementObserver />);

  expect(evalStore.get('test')).toEqual(mockStore.scribbles);
});

it('filters by title for With-Title cmdlet', async () => {
  const evalStore = new EvalStore();
  const ElementObserver = makeQuery(evalStore, `Get-Scribbles | With-Title '$:core/widget/query'`);
  await render(<ElementObserver />);

  expect((evalStore.get('test') as any)[0].scribbleID).toEqual(mockStore.scribbleByTitle('$:core/widget/query')!.scribbleID);
});
