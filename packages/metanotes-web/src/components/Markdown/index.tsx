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


import { compile } from '@metanotes/remark-metareact';
import components from './components';
import { useStyles } from './styles';
import MarkdownStacktrace, { makeFrame } from './MarkdownStacktraceContext';


export interface MarkdownProps {
  /**
   * Sheet id to render (used to verify there's no recursion).
   */
  id: string;

  /**
   * Markdown document text.
   */
  doc: string;

  /**
   * Use inline parser (only allows inline level markdown elements).
   */
  inline?: boolean;
}

/**
 * Renders the sheet using the markdown parser.
 *
 * As a side effect, verifies we're not endlessly recursing.
 */
const Markdown = ({ id, doc, inline }: MarkdownProps) => {
  const ctx = useContext(MarkdownStacktrace);
  const classes = useStyles();

  if (ctx.parentHasId(id)) {
    console.log('recursed into');
    console.error(`${ctx.parentId()}\n${id}`);
    return <span className={classes.error}>RECURSION ERROR</span>;
  }

  const mdoc = compile(doc, components, inline === true);

  if (!mdoc) {
    return <span className={classes.error}>FAILED PARSING INLINE CONTENT</span>;
  }

  return <MarkdownStacktrace.Provider value={makeFrame(ctx, id)}>
    {mdoc}
  </MarkdownStacktrace.Provider>;
};

Markdown.whyDidYouRender = true;

export default React.memo(Markdown);
