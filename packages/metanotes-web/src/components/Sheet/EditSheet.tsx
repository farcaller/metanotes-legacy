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

import React, { useRef } from 'react';

import { Button } from '@material-ui/core';
import Editor from '@monaco-editor/react';
import { SheetDocument } from '@metanotes/store';


interface EditSheetProps {
  sheet: SheetDocument;
  onSave: (data: string) => void;
}

export const EditSheet = ({ sheet, onSave }: EditSheetProps): JSX.Element => {
  const editorRef = useRef(undefined as unknown as () => string);

  const handleEditorDidMount = (getEditorValue: () => string) => {
    editorRef.current = getEditorValue;
  };

  const wrapOnSave = () => {
    onSave(editorRef.current());
  };

  return <>
    <Button variant="outlined" onClick={wrapOnSave}>save</Button>
    <Editor
      height="400px"
      language="markdown"
      value={sheet._data}
      editorDidMount={handleEditorDidMount} />
  </>;
};
