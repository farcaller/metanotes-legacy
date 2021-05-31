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
import React, { useCallback, useState } from 'react';
import { View, StyleSheet, Text, TextInput, Platform } from 'react-native';
import { IconButton } from 'react-native-paper';

import { Scribble } from '../../store/interface/scribble';
import { useSpreadStore } from './SpreadStore';

const styles = StyleSheet.create({
  title: {
    fontFamily: 'Source Sans Pro',
    fontWeight: 'bold',
    fontSize: 20,
  },
  header: {
    flex: 1,
    flexDirection: 'row',
    borderBottomWidth: 2,
    borderStyle: 'solid',
    marginBottom: 4,
  },
  iconContainer: {
    marginLeft: 'auto',
  },
  iconContainerInner: {
    flex: 1,
    flexDirection: 'row',
  },
  labelContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  input: Platform.OS === 'web' ? {
    outlineWidth: 0,
  } as never : {},
});

interface ScribbleHeaderProps {
  scribble: Scribble;
  onSave?: (title: string) => void;
  onEdit?: () => void;
}

function ScribbleHeader({ scribble, onSave, onEdit }: ScribbleHeaderProps) {
  const spreadStore = useSpreadStore();

  const onClose = useCallback(() => {
    spreadStore.removeScribble(scribble);
  }, [spreadStore, scribble]);

  const isEditing = onSave !== undefined;

  const [workTitle, setWorkTitle] = useState(scribble.title);

  const onTitleChange = useCallback((newTitle: string) => {
    setWorkTitle(newTitle);
  }, []);

  const title = isEditing ? (
    // TODO: extract to a child component so it doesn't redraw the whole header on change
    <TextInput
      style={styles.input}
      autoFocus
      placeholder="untitled"
      defaultValue={workTitle}
      onChangeText={onTitleChange}
      accessibilityLabel="title"
    />
  ) : (
    <Text style={styles.title}>{scribble.title}</Text>
  );

  const onSaveWrapped = useCallback(() => {
    onSave!(workTitle);
  }, [onSave, workTitle]);

  return (
    <View>
      <View style={styles.header}>
        <View style={styles.labelContainer}>
          {title}
        </View>
        <View style={styles.iconContainer}>
          <View style={styles.iconContainerInner}>
            <IconButton
              icon="close"
              size={20}
              onPress={onClose}
              accessibilityLabel="close"
            />
            {isEditing ? (
              <IconButton
                icon="check"
                size={20}
                onPress={onSaveWrapped}
                accessibilityLabel="save"
              />
            ) : (
              <IconButton
                icon="square-edit-outline"
                size={20}
                onPress={onEdit}
                accessibilityLabel="edit"
              />
            )}
          </View>
        </View>
      </View>
    </View>
  );
}

export default observer(ScribbleHeader);
