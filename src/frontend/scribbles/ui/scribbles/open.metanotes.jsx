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
 * id: 01F7NDPGBQ8Z2SQ5GQX2QGNYF7
 * content-type: application/vnd.metanotes.component-jsmodule
 * title: $:ui/scribbles/open
 * display-title: Open Scribble
 */

const { Text, View, Button, StyleSheet } = ReactNative;
const { useCallback } = React;

const styles = StyleSheet.create({
  link: {
    textDecorationStyle: 'solid',
    textDecorationLine: 'underline',
  },
});

function ScribbleButtonEL({ scribble }) {
  const openScribble = useCallback(() => {
    console.log(scribble);
  }, [scribble]);

  return (
    <Text onPress={openScribble} style={styles.link}>
      {scribble.toString()}
    </Text>
  );
}

const ScribbleButton = observer(ScribbleButtonEL);

function Open() {
  const store = useStore();

  return (
    <View>
      {store.scribbles.map((scribble) => (
        <View key={scribble.scribbleID}>
          <ScribbleButton scribble={scribble} />
        </View>
      ))}
    </View>
  );
}

export default observer(Open);
