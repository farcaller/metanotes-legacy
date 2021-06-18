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

/* attributes *
 * id: 01F7XEET6APB468F144QMEH4PV
 * content-type: application/vnd.metanotes.component-jsmodule
 * title: $:core/markdown/strong
 */

import React from '@metascribbles/react';
import { Text, StyleSheet } from '@metascribbles/react-native';

const styles = StyleSheet.create({
  strong: {
    fontWeight: 'bold',
  },
});

function Strong({ children }: React.PropsWithChildren<unknown>) {
  return (
    <Text style={styles.strong}>
      {children}
    </Text>
  );
}

export default React.memo(Strong);
