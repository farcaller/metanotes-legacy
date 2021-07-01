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
 * id: 01F94AB9G4YS1N40VW9X71PATT
 * content-type: application/vnd.metanotes.component-jsmodule
 * title: $:core/markdown/link
 */

import React, { useCallback } from '@metascribbles/react';
import { Text, StyleSheet } from '@metascribbles/react-native';

const styles = StyleSheet.create({
  link: {
    textDecorationStyle: 'solid',
    textDecorationLine: 'underline',
    paddingBottom: 4,
  },
});

function Strong({ url, title, children }: React.PropsWithChildren<{ url: string, title?: string }>) {
  // TODO: implement spreadstore
  // const spreadStore = useSpreadStore();

  const openScribble = useCallback(() => {
    if (url.startsWith('scribbleid://')) {
      const id = url.substring(13);
      // spreadStore.openByID(id);
    }
    console.error('unknown link:', url);
  }, [url]);

  return (
    <Text style={styles.link} onPress={openScribble}>
      {children}
    </Text>
  );
}

export default React.memo(Strong);
