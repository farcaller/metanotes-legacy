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
import Components from './Components';

export const MarkdownStacktrace = React.createContext({
  parentHasId: (id: string): boolean => { return false; },
  parentId: (): string => { return ''; },
});

const Markdown = ({ id, doc, inline }: any) => {
  const ctx = useContext(MarkdownStacktrace);

  if (ctx.parentHasId(id)) {
    console.log('recursed into');
    console.error(`${ctx.parentId()}\n${id}`);
    return <Text>RECURSION ERROR</Text>;
  }

  const mdoc = compile(doc, Components, inline === true);

  if (!mdoc) {
    return <Text>FAILED PARSING INLINE CONTENT</Text>;
  }

  const stacktrace = {
    parentHasId: (theId: string) => ctx.parentHasId(theId) || id === theId,
    parentId: () => `${ctx.parentId()}\n${id}`,
  };

  return <MarkdownStacktrace.Provider value={stacktrace}>
    {mdoc}
  </MarkdownStacktrace.Provider>;
};

export default Markdown;
