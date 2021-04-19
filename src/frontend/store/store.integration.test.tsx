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
import { Button, Text, View } from 'react-native';
import { fireEvent, render } from '@testing-library/react-native';

function Example() {
  const [name, setUser] = React.useState('hello world');

  const onClick = () => {
    setUser('abc');
  };

  return (
    <View>
      <Text testID="text">{name}</Text>
      <Button onPress={onClick} title="abc" />
    </View>
  )
}

test('examples of some things', async () => {
  const { getByTestId, getByText } = render(<Example />);

  expect(getByTestId('text').props.children).toEqual('hello world');

  const button = getByText('abc');
  fireEvent.press(button);
  expect(getByTestId('text').props.children).toEqual('abc');
});
