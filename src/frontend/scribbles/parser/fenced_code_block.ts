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
 * id: 01F3STHWY29M2ZNR8C6GVHG3KN
 * content-type: application/vnd.metanotes.component-jsmodule
 * title: $:core/parser/FencedCodeBlock
 * tags: ['$:core/parser']
 * parser: FencedCodeBlock
 */

import {
  string, notFollowedBy, regexp, alt, eof, seq,
} from '@metascribbles/parsimmon';

function FencedCodeBlock() {
  return seq(regexp(/ {0,3}/), regexp(/~{3,}|`{3,}/), regexp(/[^\n]*/), string('\n'))
    .chain(([indent, delimeterRun, infoString]) => {
      const trimmedInfoString = infoString.trim();
      const indentLength = indent.length;
      const delimeterChar = delimeterRun[0];
      const delimeterLength = delimeterRun.length;

      const closingDelimeterRegex = new RegExp(`${delimeterChar}{${delimeterLength},}[^\\S\\n\\r]*\\n`);
      const indentRegex = new RegExp(` {0,${indentLength}}`);

      return alt(
        notFollowedBy(
          regexp(/ {0,3}/).then(regexp(closingDelimeterRegex)),
        )
          .then(
            regexp(indentRegex).then(regexp(/[^\n]*\n/)),
          )
          .many()
          .skip(
            alt(
              eof,
              regexp(/ {0,3}/).then(regexp(closingDelimeterRegex)),
            ),
          )
          .map((lines) => ({
            type: 'code',
            value: lines.join(''),
            lang: trimmedInfoString.length > 0 ? trimmedInfoString : undefined,
          })),
        eof.map(() => ({
          type: 'code',
          value: '',
        })),
      );
    });
}

export default FencedCodeBlock;
