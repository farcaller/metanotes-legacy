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
import MDX from '@mdx-js/runtime';


import { ErrorBoundary } from '../../ScribbleResolver';
import For from './widgets/For';
import { Echo, VariablesContext } from './widgets/variables';


export interface MarkdownProps {
  text: string;
  inline?: boolean;
}

const Components = {
  For,
  Echo,
};

const emptyVarContext = (_key: string) => undefined;

const Markdown = ({ text, inline }: MarkdownProps) => {
  return (
    <ErrorBoundary>
      <VariablesContext.Provider value={emptyVarContext}>
        <MDX components={Components}>{text}</MDX>
      </VariablesContext.Provider>
    </ErrorBoundary>
  );
};


export default React.memo(Markdown);
