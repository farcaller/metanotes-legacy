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

import React, { useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { IconButton } from 'react-native-paper';

import colors from './colors';
import { useSpreadStore } from './SpreadStore';

const styles = StyleSheet.create({
  container: {
    width: 300,
    height: '100%',
    backgroundColor: colors.background,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  spreadContainer: {
    width: '100%',
  },
  spacer: {
    height: 40,
  },
});

interface ActionsScribbleProps {
  // eslint-disable-next-line react/require-default-props
  spread?: boolean;
}

function ActionsScribble({ spread = false }: ActionsScribbleProps) {
  const spreadStore = useSpreadStore();

  const onCreate = useCallback(() => spreadStore.createScribble(), [spreadStore]);

  const onOpen = useCallback(() => spreadStore.openScribble('$:ui/scribbles/open'), [spreadStore]);

  return (
    <View style={[styles.container, spread ? styles.spreadContainer : undefined]}>
      <IconButton
        icon="shape-square-plus"
        accessibilityLabel="create new scribble"
        size={40}
        onPress={onCreate}
      />
      <View style={styles.spacer} />
      <IconButton
        icon="feature-search-outline"
        size={40}
        onPress={onOpen}
      />
    </View>
  );
}

export default React.memo(ActionsScribble);
