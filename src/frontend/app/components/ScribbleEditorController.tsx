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

import React, { useCallback, useEffect, useRef, useState } from 'react';
import Editor, { Monaco } from '@monaco-editor/react';
import { useWindowDimensions } from 'react-native';
import { observer } from 'mobx-react-lite';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import { useDebouncedCallback } from 'use-debounce';

import Scribble from '../../store/scribble/scribble';
import ScribbleHeader from './ScribbleHeader';
import { DraftKey, TitleKey } from '../../store/scribble/metadata';

const BackgroundColor = '#fff7df';

const MonacoOptions: monaco.editor.IStandaloneEditorConstructionOptions = {
  automaticLayout: true,
  fontSize: 16,
  // fontFamily: 'Space Mono',
  minimap: {
    enabled: false,
  },
  wordWrap: 'on',
  lineNumbers: 'off',
  renderLineHighlight: 'none',
  glyphMargin: false,
  folding: false,
  lineDecorationsWidth: 0,
  lineNumbersMinChars: 0,
};

const MonacoTheme = {
  base: 'vs' as monaco.editor.BuiltinTheme,
  inherit: true,
  rules: [
    { token: 'keyword.md', foreground: '#000000', fontStyle: 'bold' },
    { background: BackgroundColor } as unknown as monaco.editor.ITokenThemeRule,
  ],
  colors: {
    'editor.background': BackgroundColor,
  },
};

function ScribbleEditorController({ scribble }: { scribble: Scribble }) {
  const [workVersion] = useState(scribble.latestVersion);

  // TODO: sync
  const [workBody, setWorkBody] = useState(workVersion.body !== null ? workVersion.body : '');

  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const window = useWindowDimensions();
  const [monacoHeight, setMonacoHeight] = useState(window.height);

  const handleEditorDidMount = useCallback((editor: monaco.editor.IStandaloneCodeEditor) => {
    editorRef.current = editor;
  }, [editorRef]);

  const handleEditorWillMount = useCallback((monaco1: Monaco) => {
    monaco1.editor.defineTheme('myTheme', MonacoTheme);
  }, []);

  useEffect(() => {
    if (window.height === monacoHeight) { return; }
    setMonacoHeight(window.height);
    if (editorRef.current) {
      editorRef.current.layout({
        width: 0,
        height: 0,
      });
      editorRef.current.layout();
    }
  }, [editorRef, window, monacoHeight]);

  const onChangeDebounced = useDebouncedCallback(
    (value?: string) => {
      if (value === undefined) { return; }
      setWorkBody(value);
    },
    2000,
  );

  const onSave = useCallback((title: string) => {
    let value = '';
    if (editorRef === null || editorRef.current === null) {
      console.warn(`requested save when editorRef isn't ready`);
      value = workBody;
    } else {
      value = editorRef.current.getValue();
    }
    const meta = workVersion.clonedMetadata;
    meta.delete(DraftKey);
    meta.set(TitleKey, title);
    scribble.createStableVersion(value, meta);
  }, [scribble, workVersion, workBody]);

  return (
    <>
      <ScribbleHeader scribble={scribble} onSave={onSave} />
      <Editor
        defaultLanguage="markdown"
        defaultValue={workBody}
        theme="myTheme"
        options={MonacoOptions}
        beforeMount={handleEditorWillMount}
        onMount={handleEditorDidMount}
        onChange={onChangeDebounced}
      />
    </>
  );
}

export default observer(ScribbleEditorController);
