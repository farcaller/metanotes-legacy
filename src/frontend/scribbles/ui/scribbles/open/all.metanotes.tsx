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
 * id: 01F7VCS4ZXQ6ET1511ZF44S67G
 * content-type: application/vnd.metanotes.component-jsmodule
 * title: $:ui/scribbles/open/all
 */

import React, { useCallback, useState } from '@metascribbles/react';
import { useStore, observer, Scribble } from '@metascribbles/store';
import { Text, View, StyleSheet, Switch } from '@metascribbles/react-native';

const styles = StyleSheet.create({
  switchLayout: {
    flex: 1,
    flexDirection: 'row',
    marginBottom: 8,
    marginTop: 8,
  },
  switchText: {
    marginLeft: 8,
  },
  title: {
    fontWeight: 'bold',
    textDecorationStyle: 'solid',
    textDecorationLine: 'underline',
    paddingBottom: 4,
  },
});

function ScribbleButtonEL({ scribble }: { scribble: Scribble }) {
  const openScribble = useCallback(() => {
    console.log(scribble);
  }, [scribble]);

  return (
    <Text style={styles.title} onPress={openScribble}>
      {scribble.title ? scribble.title : `untitled scribble \$\$${scribble.scribbleID}`}
    </Text>
  );
}

const ScribbleButton = observer(ScribbleButtonEL);

function OpenAll() {
  const store = useStore();
  const [showCore, setShowCore] = useState(false);

  const onToggleShowCore = useCallback(() => setShowCore((show) => !show), []);

  let { scribbles } = store;
  if (!showCore) {
    scribbles = scribbles.filter((scribble) => !scribble.latestVersion.isCore);
  }

  return (
    <View>
      <View style={styles.switchLayout}>
        <Switch value={showCore} onValueChange={onToggleShowCore} />
        <Text style={styles.switchText}>Show core scribbles</Text>
      </View>
      {scribbles.map((scribble) => (
        <View key={scribble.scribbleID}>
          <ScribbleButton scribble={scribble} />
        </View>
      ))}
    </View>
  );
}

export default observer(OpenAll);
