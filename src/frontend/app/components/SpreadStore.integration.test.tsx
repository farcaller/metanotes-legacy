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
import { render, fireEvent } from '@testing-library/react-native';
import TestRenderer from 'react-test-renderer';

import ScribblesStore from '../../store/store';
import { StorageAPI } from '../../store/client';
import { ExternalSpreadStoreProvider, SpreadStore } from './SpreadStore';
import { ExternalStore } from './Store';
import CommonUIProvider from '../ui';
import ScribblesContainer from './ScribblesContainer';

const { act } = TestRenderer;

test('it adds a new scribble to the spread', () => {
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
  const { getByA11yLabel } = render(<Root />);

  act(() => {
    const createNewButton = getByA11yLabel('create new scribble');
    fireEvent.press(createNewButton);
  });

  expect(spreadStore.scribbles).toHaveLength(1);
});

test('it commits the new scribble on save', () => {
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
  const { getByA11yLabel } = render(<Root />);

  act(() => {
    const createNewButton = getByA11yLabel('create new scribble');
    fireEvent.press(createNewButton);
  });

  act(() => {
    const titleInput = getByA11yLabel('title');
    fireEvent.changeText(titleInput, 'hello');
  });

  act(() => {
    const saveButton = getByA11yLabel('save');
    fireEvent.press(saveButton);
  });

  expect(store.scribbleByTitle('hello')?.allVersions).toHaveLength(2);
});

test('it removes the new scribble if closed before it was changed', () => {
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
  const { getByA11yLabel } = render(<Root />);

  act(() => {
    const createNewButton = getByA11yLabel('create new scribble');
    fireEvent.press(createNewButton);
  });

  const scribble = spreadStore.scribbles[0];

  act(() => {
    const saveButton = getByA11yLabel('close');
    fireEvent.press(saveButton);
  });

  expect(store.scribbleByID(scribble.scribbleID)).toBeUndefined();
});

test('it removes the new draft if closed before the scribble was changed', () => {
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
  const { getByA11yLabel } = render(<Root />);

  act(() => {
    const createNewButton = getByA11yLabel('edit');
    fireEvent.press(createNewButton);
  });

  act(() => {
    const saveButton = getByA11yLabel('close');
    fireEvent.press(saveButton);
  });

  expect(scribble.allVersions).toHaveLength(2);
});

test(`it removes the scribble from the spread if closed but doesn't mutate it`, () => {
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
  const { getByA11yLabel } = render(<Root />);

  act(() => {
    const saveButton = getByA11yLabel('close');
    fireEvent.press(saveButton);
  });

  expect(spreadStore.scribbles).toHaveLength(0);

  const scribSnapshot2 = scribble.toProto().toObject();
  expect(scribSnapshot).toEqual(scribSnapshot2);
});

test.todo('it shows the confirmation dialog if attempting to close a dirty edited scribble');
