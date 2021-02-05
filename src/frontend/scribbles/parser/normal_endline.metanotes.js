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
 * id: 01EV2BTGF3BWGR5Q87R664Q8TT
 * content-type: application/vnd.metanotes.component-jsmodule
 * title: $:core/parser/NormalEndline
 * tags: ['$:core/parser']
 * parser: NormalEndline
 */

const { string, seq, alt } = components.Parsimmon;

function NormalEndline(r) {
  // TODO: a newline not followed by a start of any other block. add all the other blocks (e.g. lists)
  return r.Sp.then(r.Newline)
    .notFollowedBy(r.BlankLine)
    .notFollowedBy(string('>'))
    .notFollowedBy(r.AtxStart)
    .notFollowedBy(seq(
      r.Line,
      alt(string('=').atLeast(1), string('-').atLeast(1)),
      r.Newline,
    ))
    .map(() => ({
      type: 'text',
      value: '\n',
    }));
}

export default NormalEndline;
