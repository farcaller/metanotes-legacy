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
import { Alert } from '@material-ui/lab';


import { compile } from '@metanotes/remark-metareact';
import components from './components';


export interface MarkdownProps {
  text: string;
  inline?: boolean;
}

const Markdown = ({ text, inline }: MarkdownProps) => {
  const documentEl = compile(text, components, inline === true);

  if (!documentEl) {
    return <Alert severity="error">failed to parse the markdown document</Alert>;
  }

  return documentEl;
};


export default React.memo(Markdown);
