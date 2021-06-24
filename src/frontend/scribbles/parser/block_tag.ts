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
 * id: 01F8G1QDDH3AKFPTN50JVANRFD
 * content-type: application/vnd.metanotes.component-jsmodule
 * title: $:core/parser/BlockTag
 * tags: ['$:core/parser']
 * parser: BlockTag
 */

import { string, regexp, seqMap } from '@metascribbles/parsimmon';

function BlockTagGeneratorFunc(args) {
  function BlockTag(r) {
    return seqMap(
      string('<'),
      regexp(/[a-zA-Z]\w*/),
      r.TagProp.many(),
      regexp(/\s*>/),
      (_, name, props: Record<string, string>[]) => ({
        type: 'widget',
        name: name.toLowerCase(),
        tagName: name,
        props: props.reduce((acc, curr) => ({ ...acc, ...curr }), {}),
      }),
    )
      .chain((el) => seqMap(
        args.rebuildParser({ currentBlockTag: el.tagName }).BlockContent,
        string('<'),
        string('/'),
        string(el.tagName),
        string('>'),
        (children: unknown[]) => {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { tagName, ...rest } = el;
          return {
            ...rest,
            children: children.filter((child) => child),
          };
        },
      ));
  }

  return BlockTag;
}

BlockTagGeneratorFunc.generatorFunc = true;

export default BlockTagGeneratorFunc;
