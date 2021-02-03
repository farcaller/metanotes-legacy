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

import React, { useMemo } from 'react';
import { Alert } from '@material-ui/lab';
import equals from 'deep-equal';


import { compile } from '../../../metamarkdown/ast';
import components from './components';
import { useTypedSelector } from '../../../store';
import { Scribble, selectScribblesByTag } from '../../../store/features/scribbles';
import makeParser from '../../../metamarkdown/parser/parser';


export interface MarkdownProps {
  text: string;
  inline?: boolean;
}

const Markdown = ({ text, inline }: MarkdownProps) => {
  const parserScribbles = useTypedSelector(state => selectScribblesByTag(state, '$:core/parser'), equals);
  const parserScribblesKeyed = useMemo(() => {
    const scribsByName = {} as { [key: string]: Scribble };
    for (const sc of parserScribbles) {
      const parser = sc.attributes['parser'];
      if (parser !== undefined) {
        scribsByName[parser] = sc;
      }
    }
    return scribsByName;
  }, [parserScribbles]);
  // TODO: these scribbles might not be loaded?

  const documentEl = compile(text + '\n\n', components, inline === true, makeParser, parserScribblesKeyed);

  if (!documentEl) {
    return <Alert severity="error">failed to parse the markdown document</Alert>;
  }

  return documentEl;
};

export default React.memo(Markdown);
