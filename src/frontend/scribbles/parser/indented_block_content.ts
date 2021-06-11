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
 * id: 01F3NPY65KK505A2AYKGHDJHEN
 * content-type: application/vnd.metanotes.component-jsmodule
 * title: $:core/parser/IndentedBlockContent
 * tags: ['$:core/parser']
 * parser: IndentedBlockContent
 */

import { alt, seqMap, string } from '@metascribbles/parsimmon';

const finalizeParagraphs = require('$:core/parser-helpers/finalizeParagraphs');

function IndentedBlockContent(r) {
  return seqMap(
    r.PartialBlockContent,
    alt(
      r.IndentSame.then(r.PartialBlockContent),
      string('\n').map(() => ({ type: 'empty_line' })),
    ).many(),
    (first, rest) => finalizeParagraphs(r, [first, ...rest]),
  );
}

export default IndentedBlockContent;
