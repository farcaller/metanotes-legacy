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
import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import useStore from '../../store/scribbles_store/use_context';
import colors from './colors';

const toolbarTextColor = 'rgb(88, 110, 117)';

const styles = StyleSheet.create({
  toolbar: {
    position: 'absolute',
    backgroundColor: colors.backgroundDarker,
    left: 0,
    bottom: 0,
    width: '100%',
    height: 22,
    padding: 2,
    textAlignVertical: 'center',
  },
  text: {
    fontSize: 14,
    color: toolbarTextColor,
  },
});

function StatusBar(): JSX.Element {
  const store = useStore();

  return (
    <View style={styles.toolbar}>
      <Text>
        <Text style={styles.text}>
          {`total scribbles: ${store.scribbles.length}`}
        </Text>
      </Text>
    </View>
  );
}

export default observer(StatusBar);
