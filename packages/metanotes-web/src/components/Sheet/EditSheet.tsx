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

import React, { useRef, useState } from 'react';
import * as monacoEditor from 'monaco-editor/esm/vs/editor/editor.api';

import { Button } from '@material-ui/core';
import Editor, { EditorDidMount } from '@monaco-editor/react';
import { SheetDocument } from '@metanotes/store';
import Markdown from '../Markdown';
import MarkdownStacktrace from '../Markdown/MarkdownStacktraceContext';


interface EditSheetProps {
  sheet: SheetDocument;
  onSave: (data: string) => void;
  onClose: () => void;
}

export const EditSheet = ({ sheet, onSave, onClose }: EditSheetProps): JSX.Element => {
  const editorRef = useRef(undefined as monacoEditor.editor.IStandaloneCodeEditor|undefined);

  const [showPreview, setShowPreview] = useState(false);
  // TODO: we need to settle on wether the sheet always has data
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const [previewedText, setPreviewedText] = useState(sheet._data!);

  const handleEditorDidMount: EditorDidMount = (_, editor) => {
    editorRef.current = editor;

    editorRef.current.onDidChangeModelContent(() => {
      if (showPreview) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        setPreviewedText(editorRef.current!.getValue());
      }
    });
  };

  const wrapOnSave = () => {
    if (editorRef.current === undefined) {
      console.error('monaco editor ref is undefined while saving');
      return;
    }
    onSave(editorRef.current.getValue());
  };

  const onTogglePreview = () => {
    setShowPreview(!showPreview);
    // TODO: this sucks. any better option?
    setTimeout(() => { editorRef.current?.layout(); }, 0);
  };

  let previewPane = <></>;
  if (showPreview) {
    const stacktrace = {
      parentHasId: () => false,
      parentId: () => '',
    };

    previewPane = (
      <MarkdownStacktrace.Provider value={stacktrace}>
        <Markdown id={sheet._id} doc={previewedText} />
      </MarkdownStacktrace.Provider>
    );
  }

  return <>
    <Button variant="outlined" onClick={wrapOnSave}>save</Button>
    <Button variant="outlined" onClick={onClose}>cancel</Button>
    <Button variant="outlined" onClick={onTogglePreview}>toggle preview</Button>

    {
      showPreview ? previewPane :
      <Editor
        height="400px"
        width={showPreview?'50%':'100%'}
        language="markdown"
        value={sheet._data}
        editorDidMount={handleEditorDidMount}
        options={{minimap: {enabled: false}}}
      />
    }
  </>;
};
