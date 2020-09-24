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

import React, { useState, useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useDispatch } from 'react-redux';

import { parse } from '@metanotes/remark-metareact';
import { setSheet } from '@metanotes/store';
import Markdown, { MarkdownStacktrace } from './Markdown';


const ViewSheet = ({ sheet, onEdit }: any) => {
  const stacktrace = {
    parentHasId: (theId: string) => false,
    parentId: () => '',
  };

  const onDumpAST = () => {
    const ast = parse(sheet._data);
    console.log(ast);
  }

  return (
    <>
      <Text>{sheet.title}</Text>
      <View>
        <MarkdownStacktrace.Provider value={stacktrace}>
          <Markdown id={sheet._id} doc={sheet._data} />
        </MarkdownStacktrace.Provider>
      </View>
    </>
  );
};

const Sheet = ({ sheet }: any) => {
  const [editing, setEditing] = useState(false);

  const dispatch = useDispatch();

  const onEdit = () => {
    setEditing(true);
  };

  const onSave = (data: string) => {
    dispatch(setSheet({ id: sheet._id, data }));
    setEditing(false);
  };

  return (
    <View>
      <ViewSheet sheet={sheet} onEdit={onEdit} />
    </View>
  );
};

export default Sheet;
