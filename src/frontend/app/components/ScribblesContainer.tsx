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
import { FlatList, StyleSheet } from 'react-native';
import { observer } from 'mobx-react-lite';

import colors from './colors';
import Separator from './Separator';
import useSpreadStore from '../../store/spread_store/use_context';
import Scribble from '../../store/scribble/scribble';
import ActionsScribble from './ActionsScribble';
import ScribbleContainer from './ScribbleContainer';

const ActionsScribbleID = '__actions';

const styles = StyleSheet.create({
  container: {
    height: '100%',
    width: '100%',
    backgroundColor: colors.background,
  },
});

function keyExtractor(item: Scribble): string {
  return item.scribbleID;
}

function renderItem({ item }: { item: Scribble }) {
  if (item.scribbleID !== ActionsScribbleID) {
    return <ScribbleContainer scribble={item} />;
  }
  return <ActionsScribble />;
}

function ScribblesContainer() {
  const spreadStore = useSpreadStore();

  const items = [...spreadStore.scribbles, { scribbleID: ActionsScribbleID } as Scribble];

  if (spreadStore.scribbles.length === 0) {
    return <ActionsScribble spread />;
  }
  return (
    <FlatList
      style={styles.container}
      data={items}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      ItemSeparatorComponent={Separator}
      horizontal
    />
  );
}

export default observer(ScribblesContainer);
