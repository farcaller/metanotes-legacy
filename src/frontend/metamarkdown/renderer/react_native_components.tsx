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

import React, { PropsWithChildren } from 'react';
import { View, Text } from 'react-native';

import ComponentsInterface from './components';

const Components: ComponentsInterface = {
  paragraph: ({ children }: PropsWithChildren<unknown>) => <View>{children}</View>,
  heading: () => <View />,
  thematicBreak: () => <View />,
  blockquote: () => <View />,
  list: () => <View />,
  listItem: () => <View />,
  table: () => <View />,
  tableRow: () => <View />,
  tableCell: () => <View />,
  code: () => <View />,

  text: ({ children }: PropsWithChildren<unknown>) => <Text>{children}</Text>,
  emphasis: () => <View />,
  strong: () => <View />,
  delete: () => <View />,
  inlineCode: () => <View />,
  break: () => <View />,
  image: () => <View />,

  link: () => <View />,

  widget: (_name: string) => () => <View />,
  wikiLink: () => <View />,
};

export default Components;
