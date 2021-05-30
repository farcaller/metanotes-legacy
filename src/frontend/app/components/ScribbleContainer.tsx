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

import { observer } from 'mobx-react-lite';
import React, { useCallback } from 'react';
import { View, StyleSheet, ScrollView, Text } from 'react-native';

import { Scribble } from '../../store/interface/scribble';
import ScribbleEditorController from './ScribbleEditorController';
import ScribbleHeader from './ScribbleHeader';

const styles = StyleSheet.create({
  container: {
    width: 600,
    height: '100%',
    marginLeft: 10,
    marginRight: 10,
  },
});

function ScribbleContainer({ scribble }: { scribble: Scribble}) {
  const version = scribble.latestVersion;

  const onEdit = useCallback(() => {
    scribble.createDraftVersion();
  }, [scribble]);

  if (version.isDraft) {
    return (
      <View style={styles.container}>
        <ScribbleEditorController scribble={scribble} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScribbleHeader scribble={scribble} onEdit={onEdit} />
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text>{version.body}</Text>
      </ScrollView>
    </View>
  );
}

export default observer(ScribbleContainer);
