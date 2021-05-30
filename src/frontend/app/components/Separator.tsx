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
import { View, StyleSheet } from 'react-native';

import colors from './colors';

const styles = StyleSheet.create({
  separator: {
    height: '100vh',
    marginLeft: 15,
    marginRight: 15,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  separatorInner: {
    height: '90vh',
    borderLeftColor: colors.separator,
    borderLeftWidth: 1,
  },
});

function Separator() {
  return (
    <View style={styles.separator}>
      <View style={styles.separatorInner} />
    </View>
  );
}

export default React.memo(Separator);
