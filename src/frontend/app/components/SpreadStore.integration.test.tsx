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

/* eslint-disable @typescript-eslint/no-non-null-assertion,import/first */

import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';

jest.mock('./ScribbleEditorController');

import ScribblesStore from '../../store/store';
import { StorageAPI } from '../../store/client';
import { ExternalSpreadStoreProvider, SpreadStore } from './SpreadStore';
import { ExternalStore } from './Store';
import CommonUIProvider from '../ui';
import ScribblesContainer from './ScribblesContainer';

test('it adds a new scribble to the spread', async () => {
  const store = new ScribblesStore(undefined as unknown as StorageAPI);
  const spreadStore = new SpreadStore(store);

  function Root() {
    return (
      <ExternalStore store={store}>
        <CommonUIProvider>
          <ExternalSpreadStoreProvider store={spreadStore}>
            <ScribblesContainer />
          </ExternalSpreadStoreProvider>
        </CommonUIProvider>
      </ExternalStore>
    );
  }
  const { findByA11yLabel } = render(<Root />);

  const createNewButton = await findByA11yLabel('create new scribble');
  fireEvent.press(createNewButton);

  expect(spreadStore.scribbles).toHaveLength(1);
});

test('it commits the new scribble on save', async () => {
  const store = new ScribblesStore(undefined as unknown as StorageAPI);
  const spreadStore = new SpreadStore(store);

  function Root() {
    return (
      <ExternalStore store={store}>
        <CommonUIProvider>
          <ExternalSpreadStoreProvider store={spreadStore}>
            <ScribblesContainer />
          </ExternalSpreadStoreProvider>
        </CommonUIProvider>
      </ExternalStore>
    );
  }
  const { findByA11yLabel } = render(<Root />);

  const createNewButton = await findByA11yLabel('create new scribble');
  fireEvent.press(createNewButton);

  const titleInput = await findByA11yLabel('title');
  fireEvent.changeText(titleInput, 'hello');

  const saveButton = await findByA11yLabel('save');
  fireEvent.press(saveButton);

  expect(store.scribbleByTitle('hello')?.allVersions).toHaveLength(2);
});

test('it removes the new scribble if closed before it was changed', async () => {
  const store = new ScribblesStore(undefined as unknown as StorageAPI);
  const spreadStore = new SpreadStore(store);

  function Root() {
    return (
      <ExternalStore store={store}>
        <CommonUIProvider>
          <ExternalSpreadStoreProvider store={spreadStore}>
            <ScribblesContainer />
          </ExternalSpreadStoreProvider>
        </CommonUIProvider>
      </ExternalStore>
    );
  }
  const { findByA11yLabel } = render(<Root />);

  const createNewButton = await findByA11yLabel('create new scribble');
  fireEvent.press(createNewButton);

  const scribble = spreadStore.scribbles[0];

  const saveButton = await findByA11yLabel('close');
  fireEvent.press(saveButton);

  expect(store.scribbleByID(scribble.scribbleID)).toBeUndefined();
});

test('it removes the new draft if closed before the scribble was changed', async () => {
  const store = new ScribblesStore(undefined as unknown as StorageAPI);
  const spreadStore = new SpreadStore(store);

  const scribble = store.createDraftScribble();
  scribble.createStableVersion('hello', new Map().set('mn-title', 'world'));
  spreadStore.scribbles.push(scribble);

  function Root() {
    return (
      <ExternalStore store={store}>
        <CommonUIProvider>
          <ExternalSpreadStoreProvider store={spreadStore}>
            <ScribblesContainer />
          </ExternalSpreadStoreProvider>
        </CommonUIProvider>
      </ExternalStore>
    );
  }
  const { findByA11yLabel } = render(<Root />);

  const createNewButton = await findByA11yLabel('edit');
  fireEvent.press(createNewButton);

  const saveButton = await findByA11yLabel('close');
  fireEvent.press(saveButton);

  expect(scribble.allVersions).toHaveLength(2);
});

test(`it removes the scribble from the spread if closed but doesn't mutate it`, async () => {
  const store = new ScribblesStore(undefined as unknown as StorageAPI);
  const spreadStore = new SpreadStore(store);

  const scribble = store.createDraftScribble();
  scribble.createStableVersion('hello', new Map().set('mn-title', 'world'));
  spreadStore.scribbles.push(scribble);

  const scribSnapshot = scribble.toProto().toObject();

  function Root() {
    return (
      <ExternalStore store={store}>
        <CommonUIProvider>
          <ExternalSpreadStoreProvider store={spreadStore}>
            <ScribblesContainer />
          </ExternalSpreadStoreProvider>
        </CommonUIProvider>
      </ExternalStore>
    );
  }
  const { findByA11yLabel } = render(<Root />);

  const saveButton = await findByA11yLabel('close');
  await act(() => fireEvent.press(saveButton));

  expect(spreadStore.scribbles).toHaveLength(0);

  const scribSnapshot2 = scribble.toProto().toObject();
  expect(scribSnapshot).toEqual(scribSnapshot2);
});

test.todo('it shows the confirmation dialog if attempting to close a dirty edited scribble');
