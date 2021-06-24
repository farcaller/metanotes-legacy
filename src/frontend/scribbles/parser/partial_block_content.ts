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
 * id: 01F3STC4EYBK8A7CMRDHB526PZ
 * content-type: application/vnd.metanotes.component-jsmodule
 * title: $:core/parser/PartialBlockContent
 * tags: ['$:core/parser']
 * parser: PartialBlockContent
 */

import { notFollowedBy, seq, string } from '@metascribbles/parsimmon';

function PartialBlockContentGeneratorFunc({ currentBlockTag }) {
  function NonTagClosing(r) {
    return notFollowedBy(seq(
      string('<'),
      string('/'),
      string(currentBlockTag),
      string('>'),
    )).then(r.NonTagPartialBlockContent);
  }
  function Closing(r) {
    return r.NonTagPartialBlockContent;
  }
  return currentBlockTag === undefined ? Closing : NonTagClosing;
}

PartialBlockContentGeneratorFunc.generatorFunc = true;

export default PartialBlockContentGeneratorFunc;
