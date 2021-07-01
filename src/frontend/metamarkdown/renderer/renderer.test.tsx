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

import markdownRender from './renderer';
import components from './react_native_components';
import MockStore from '../../store/scribbles_store/mock_store';

test('it renders a markdown document', async () => {
  const mockStore = MockStore();

  function Element() {
    return markdownRender('hello\n\nworld\n', false, mockStore.scribblesByTag('$:core/parser'), components);
  }
  const { toJSON } = render(<Element />);

  expect(toJSON()).toMatchInlineSnapshot(`
Array [
  <View>
    <Text>
      hello
    </Text>
  </View>,
  <View>
    <Text>
      world
    </Text>
  </View>,
]
`);
});
