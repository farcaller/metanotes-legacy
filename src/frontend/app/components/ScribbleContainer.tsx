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
import React, { useCallback, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Text } from 'react-native';
import { comparer, computed } from 'mobx';

import ScribblesStore from '../../store/scribbles_store/scribbles_store_interface';
import useStore from '../../store/scribbles_store/use_context';
import Scribble from '../../store/scribble/scribble_interface';
import ScribbleEditorController from './ScribbleEditorController';
import ScribbleHeader from './ScribbleHeader';
import render from '../../metamarkdown/renderer/renderer';
import components from '../../metamarkdown/renderer/react_native_components';
import Components from '../../metamarkdown/renderer/components';
import EvalStoreProvider from '../../store/eval_store/provider';
import useEvalStore from '../../store/eval_store/use_context';

const styles = StyleSheet.create({
  container: {
    width: 600,
    height: '100%',
    marginLeft: 10,
    marginRight: 10,
  },
});

function withComponents(store: ScribblesStore): Components {
  return {
    ...components,
    paragraph: store.requireScribble('$:core/markdown/paragraph'),
    text: store.requireScribble('$:core/markdown/text'),
    link: store.requireScribble('$:core/markdown/link'),
    strong: store.requireScribble('$:core/markdown/strong'),
    emphasis: store.requireScribble('$:core/markdown/emphasis'),
    widget: (name: string) => store.requireScribble(`$:core/widget/${name}`),
  };
}

function MarkdownBodyWrapper({ body, parserScribbles, comps }:
  { body: string; parserScribbles: Scribble[], comps: Components}) {
  return render(body, false, parserScribbles, comps);
}

const MarkdownBodyWrapperEl = observer(MarkdownBodyWrapper);

function MarkdownBodyEl({ scribble }: { scribble: Scribble }) {
  const store = useStore();
  const evalStore = useEvalStore();

  const parserScribbles = computed(() => store.scribblesByTag('$:core/parser'), {
    equals: comparer.shallow,
  }).get();
  const comps = computed(() => withComponents(store), {
    equals: comparer.shallow,
  }).get();

  useEffect(() => {
    // TODO: I should feel bad about doing this.
    evalStore.set('components', comps);
  }, [evalStore, comps]);

  // TODO: load
  return (
    <MarkdownBodyWrapperEl
      body={scribble.latestVersion.body! + '\n'}
      parserScribbles={parserScribbles}
      comps={comps}
    />
  );
}

const MarkdownBody = observer(MarkdownBodyEl);

function JSModuleBodyEl({ scribble }: { scribble: Scribble }) {
  const El = scribble.JSModule as React.FC;
  return <El />;
}

const JSModuleBody = observer(JSModuleBodyEl);

function ScribbleBodyEl({ scribble }: { scribble: Scribble }) {
  switch (scribble.latestVersion.getMeta('content-type')) {
    case 'text/markdown':
      return <MarkdownBody scribble={scribble} />;
    case 'application/vnd.metanotes.component-jswidget':
      return <JSModuleBody scribble={scribble} />;
    default:
      return (
        <>
          <Text>
            unknown content type {scribble.latestVersion.getMeta('content-type')}
          </Text>
          <Text>{scribble.latestVersion.body}</Text>
        </>
      );
  }
}

const ScribbleBody = observer(ScribbleBodyEl);

function ScribbleContainer({ scribble }: { scribble: Scribble}) {
  const version = scribble.latestVersion;

  const onEdit = useCallback(() => {
    scribble.createDraftVersion();
  }, [scribble]);

  if (version.meta.isDraft) {
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
        <EvalStoreProvider>
          <ScribbleBody scribble={scribble} />
        </EvalStoreProvider>
      </ScrollView>
    </View>
  );
}

export default observer(ScribbleContainer);
