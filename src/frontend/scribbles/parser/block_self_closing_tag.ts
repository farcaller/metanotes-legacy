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

/* attributes *
 * id: 01F8G065E9JEF9BXZ67X0JAVWZ
 * content-type: application/vnd.metanotes.component-jsmodule
 * title: $:core/parser/BlockSelfClosingTag
 * tags: ['$:core/parser']
 * parser: BlockSelfClosingTag
 */

import { string, regexp, seqMap } from '@metascribbles/parsimmon';

function BlockSelfClosingTag(r) {
  return seqMap(
    string('<'),
    regexp(/[a-zA-Z]\w*/),
    r.TagProp.many(),
    regexp(/\s*\//),
    string('>'),
    (_, name, props: Record<string, string>[]) => ({
      type: 'widget',
      name: name.toLowerCase(),
      props: props.reduce((acc, curr) => ({ ...acc, ...curr }), {}),
    }),
  );
}

export default BlockSelfClosingTag;
