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

import React, { useContext } from 'react';

import { Box, Button, IconButton } from '@material-ui/core';
import { parse } from '@metanotes/remark-metareact';
import CloseIcon from '@material-ui/icons/Close';

import Markdown from '../Markdown';
import MarkdownStacktrace from '../Markdown/MarkdownStacktraceContext';
import { SheetDocument } from '@metanotes/store';
import useStyles from './styles';
import WikiLinkingContext from '../Markdown/WikiLinkingContext';


interface ViewSheetProps {
  sheet: SheetDocument;
  onEdit: () => void;
}

const ViewSheet = ({ sheet, onEdit }: ViewSheetProps) => {
  const classes = useStyles();

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

  const spreadActions = useContext(WikiLinkingContext);
  const onClose = (event: React.SyntheticEvent) => {
    event.preventDefault();
    spreadActions.closeSheet(sheet._id);
  };

  return (
    <>
      <Box>
        <Button variant="outlined" onClick={onEdit}>edit</Button>
        <Button variant="outlined" onClick={onDumpAST}>dump AST</Button>

        <IconButton className={classes.floatRight} onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </Box>
      
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
