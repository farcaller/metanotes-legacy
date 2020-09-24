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


interface Stacktrace {
  parentHasId(id: string): boolean;
  parentId(): string;
}

/**
 * A context to keep track of the sheet IDs involved in the chain of `<Markdown/>`
 * documents.
 */
const MarkdownStacktrace = React.createContext(null as unknown as Stacktrace);

export default MarkdownStacktrace;

/**
 * Creates a new stack frame.
 *
 * @param ctx - the parent context
 * @param id - current sheet's ID
 */
export const makeFrame = (ctx: Stacktrace, id: string): Stacktrace => ({
  parentHasId: (theId: string) => ctx.parentHasId(theId) || id === theId,
  parentId: () => `${ctx.parentId()}\n${id}`,
});
