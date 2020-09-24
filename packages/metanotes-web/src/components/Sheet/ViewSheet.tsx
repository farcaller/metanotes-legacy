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

import { Button } from '@material-ui/core';
import { parse } from '@metanotes/remark-metareact';

import Markdown from '../Markdown';
import MarkdownStacktrace from '../Markdown/MarkdownStacktraceContext';
import { SheetDocument } from '@metanotes/store';


interface ViewSheetProps {
  sheet: SheetDocument;
  onEdit: () => void;
}

const ViewSheet = ({ sheet, onEdit }: ViewSheetProps) => {
  const stacktrace = {
    parentHasId: () => false,
    parentId: () => '',
  };

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const doc = sheet._data!;

  const onDumpAST = () => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const ast = parse(doc);
    console.log(ast);
  };

  return (
    <>
      <Button variant="outlined" onClick={onEdit}>edit</Button>
      <Button variant="outlined" onClick={onDumpAST}>dump AST</Button>
      <h2>{sheet.title}</h2>
      <div>
        <MarkdownStacktrace.Provider value={stacktrace}>
          <Markdown id={sheet._id} doc={doc} />
        </MarkdownStacktrace.Provider>
      </div>
    </>
  );
};

ViewSheet.whyDidYouRender = true;

export default React.memo(ViewSheet);
