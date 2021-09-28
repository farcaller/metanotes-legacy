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
import { Text, StyleSheet } from 'react-native';
import { observer } from 'mobx-react-lite';
import { Modal } from 'react-native-paper';

import colors from './colors';

const styles = StyleSheet.create({
  container: {
    height: '90%',
    width: '90%',
    backgroundColor: colors.background,
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowColor: colors.backgroundDarker,
    shadowRadius: 6,
    borderColor: colors.backgroundDarker,
    borderRadius: 4,
  },
});

function ScribblesPicker({ visible }: { visible: boolean }) {
  return (
    <Modal
      visible={visible}
      contentContainerStyle={styles.container}
    >
      <Text>Scribbles</Text>
    </Modal>
  );
}

export default observer(ScribblesPicker);
