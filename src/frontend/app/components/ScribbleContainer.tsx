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
import React, { useCallback } from 'react';
import { View, StyleSheet, ScrollView, Text } from 'react-native';

import useStore from '../../store/context/use_context';
import { Scribble } from '../../store/interface/scribble';
import ScribbleEditorController from './ScribbleEditorController';
import ScribbleHeader from './ScribbleHeader';
import render from '../../metamarkdown/renderer/renderer';
import components from '../../metamarkdown/renderer/react_native_components';
import Components from '../../metamarkdown/renderer/components';
import { ScribblesStore } from '../../store/interface/store';
import EvalStoreContext, { EvalStore } from '../../store/scribble/eval/context';
import useEvalStore from '../../store/scribble/eval/use_context';

const styles = StyleSheet.create({
  container: {
    width: 600,
    height: '100%',
    marginLeft: 10,
    marginRight: 10,
  },
});

function useComponents(store: ScribblesStore): Components {
  return {
    ...components,
    paragraph: store.requireScribble('$:core/markdown/paragraph'),
    text: store.requireScribble('$:core/markdown/text'),
    strong: store.requireScribble('$:core/markdown/strong'),
    emphasis: store.requireScribble('$:core/markdown/emphasis'),
    widget: (name: string) => store.requireScribble(`$:core/widget/${name}`),
  };
}

function MarkdownBody({ scribble }: { scribble: Scribble }) {
  const store = useStore();

  const parserScribbles = store.scribblesByTag('$:core/parser');
  const comps = useComponents(store);

  // TODO: load
  return render(scribble.latestVersion.body! + '\n', false, parserScribbles, comps);
}

function JSModuleBodyEl({ scribble }: { scribble: Scribble }) {
  const El = scribble.JSModule as React.FC;
  return <El />;
}

const JSModuleBody = observer(JSModuleBodyEl);

function ScribbleBodyEl({ scribble }: { scribble: Scribble }) {
  switch (scribble.latestVersion.getMeta('content-type')) {
    case 'text/markdown':
      return <MarkdownBody scribble={scribble} />;
    case 'application/vnd.metanotes.component-jsmodule':
      return <JSModuleBody scribble={scribble} />;
    default:
      return (
        <Text>
          unknown content type
          {scribble.latestVersion.getMeta('content-type')}
        </Text>
      );
  }
}

const ScribbleBody = observer(ScribbleBodyEl);

function ScribbleContainer({ scribble }: { scribble: Scribble}) {
  const version = scribble.latestVersion;

  const onEdit = useCallback(() => {
    scribble.createDraftVersion();
  }, [scribble]);

  const parentEvalStore = useEvalStore();
  const evalStore = new EvalStore(parentEvalStore);

  if (version.isDraft) {
    return (
      <View style={styles.container}>
        <ScribbleEditorController scribble={scribble} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScribbleHeader scribble={scribble} onEdit={onEdit} />
      <ScrollView showsVerticalScrollIndicator={false}>
        <EvalStoreContext.Provider value={evalStore}>
          <ScribbleBody scribble={scribble} />
        </EvalStoreContext.Provider>
      </ScrollView>
    </View>
  );
}

export default observer(ScribbleContainer);
