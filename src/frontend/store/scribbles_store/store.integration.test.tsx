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
import { Text } from 'react-native';
import { render } from '@testing-library/react-native';
import { observer } from 'mobx-react-lite';
import TestRenderer from 'react-test-renderer';

import ScribblesStore from './store';
import { StorageAPI } from '../client';

const { act } = TestRenderer;

test('it renders a scribble', async () => {
  const store = new ScribblesStore(undefined as unknown as StorageAPI);
  store.loadCoreScribbles([{
    id: '01F3MK7KSKWY5ZCVA84HAVBAXD',
    body: 'hello world',
    meta: {
      'mn-title': 'test',
    },
  }]);

  function Element() {
    const scribble = store.scribbleByTitle('test');
    return <Text testID="text">{scribble?.latestStableVersion?.body}</Text>;
  }
  const { getByTestId } = render(<Element />);

  expect(getByTestId('text').props.children).toEqual('hello world');
});

test('it updates the element when the store updates', async () => {
  const store = new ScribblesStore(undefined as unknown as StorageAPI);
  store.loadCoreScribbles([{
    id: '01F3MK7KSKWY5ZCVA84HAVBAXD',
    body: 'hello world',
    meta: {
      'mn-title': 'test',
    },
  }]);

  function Element() {
    const scribble = store.scribbleByTitle('test');
    return <Text testID="text">{scribble?.latestStableVersion?.body}</Text>;
  }
  const ElementObserver = observer(Element);
  const { getByTestId } = render(<ElementObserver />);

  act(() => {
    store.scribbleByTitle('test')?.createStableVersion('new body', new Map().set('mn-title', 'test'));
  });

  expect(getByTestId('text').props.children).toEqual('new body');
});

test('it renders the scribble as a JSModule element', async () => {
  const store = new ScribblesStore(undefined as unknown as StorageAPI);
  store.loadCoreScribbles([{
    id: '01F3MK7KSKWY5ZCVA84HAVBAXD',
    body: `
import { Text } from '@metascribbles/react-native';
function ScribbleElement({ value }) {
  return <Text>{value}</Text>;
}
export default ScribbleElement;`,
    meta: {
      'mn-title': 'test',
    },
  }]);

  function Element() {
    const scribble = store.scribbleByTitle('test')!;
    const ScribbleEl = scribble.JSModule as React.FC<{value: string}>;
    return <ScribbleEl value="42" />;
  }
  const ElementObserver = observer(Element);
  const { toJSON } = render(<ElementObserver />);

  expect(toJSON()).toMatchInlineSnapshot(`
<Text>
  42
</Text>
`);
});

describe(`require scribble`, () => {
  let store: ScribblesStore;
  beforeEach(() => {
    store = new ScribblesStore(undefined as unknown as StorageAPI);
    store.loadCoreScribbles([{
      id: '01F3MK7KSKWY5ZCVA84HAVBAXD',
      body: `
import { Text } from '@metascribbles/react-native';
const another = require('another');
function ScribbleElement() {
  return <Text>{another}</Text>;
}
export default ScribbleElement;`,
      meta: {
        'mn-title': 'test',
      },
    }]);
  });

  test('it throws when trying to load a JSModule that depends on a non-compilable scribble', () => {
    store.loadCoreScribbles([{
      id: '01F3MN6PRT6MP3E836K6XBB1MN',
      body: 'bad body',
      meta: {
        'mn-title': 'another',
      },
    }]);
    const scribble = store.scribbleByTitle('test')!;

    expect(() => scribble.JSModule).toThrowError(
      /failed to evaluate scribble .+ Error: failed to transpile the body: SyntaxError: unknown: Missing semicolon/,
    );
  });

  test('it throws when trying to load a JSModule that depends on a unloaded scribble', () => {
    store.loadCoreScribbles([{
      id: '01F3MN6PRT6MP3E836K6XBB1MN',
      body: undefined as unknown as string,
      meta: {
        'mn-title': 'another',
      },
    }]);
    const scribble = store.scribbleByTitle('test')!;

    expect(() => scribble.JSModule).toThrowError(
      'failed to evaluate scribble 01F3MN6PRT6MP3E836K6XBB1MN "another": Error: body is missing',
    );
  });

  test('it renders the scribble as a JSModule element with child scribbles', () => {
    store.loadCoreScribbles([{
      id: '01F3MN6PRT6MP3E836K6XBB1MN',
      body: 'export default 42;',
      meta: {
        'mn-title': 'another',
      },
    }]);

    function Element() {
      const scribble = store.scribbleByTitle('test')!;
      const ScribbleEl = scribble.JSModule as React.FC;
      return <ScribbleEl />;
    }
    const ElementObserver = observer(Element);
    const { toJSON } = render(<ElementObserver />);

    expect(toJSON()).toMatchInlineSnapshot(`
<Text>
  42
</Text>
`);
  });

  test('it re-renders the scribble as a JSModule element with child scribbles', () => {
    store.loadCoreScribbles([{
      id: '01F3MN6PRT6MP3E836K6XBB1MN',
      body: 'export default 42;',
      meta: {
        'mn-title': 'another',
      },
    }]);

    function Element() {
      const scribble = store.scribbleByTitle('test')!;
      const ScribbleEl = scribble.JSModule as React.FC;
      return <ScribbleEl />;
    }
    const ElementObserver = observer(Element);
    const { toJSON } = render(<ElementObserver />);

    act(() => {
      store.scribbleByTitle('another')?.createStableVersion('export default 43;', new Map().set('mn-title', 'another'));
    });

    expect(toJSON()).toMatchInlineSnapshot(`
<Text>
  43
</Text>
`);
  });
});
