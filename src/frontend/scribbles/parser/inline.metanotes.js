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
 * id: 01ER0AYQQVQ91R3J4RRA6SJ0KQ
 * content-type: application/vnd.metanotes.component-jsmodule
 * title: $:core/parser/Inline
 * tags: ['$:core/parser']
 * parser: Inline
 */

const { alt } = components.Parsimmon;


function Inline(r) {
  return alt(
    r.Str,
    r.Endline,
    // | UlOrStarLine
    r.Space,
    r.Strong,
    r.Emphasis,
    // | Strike
    // | Image
    // | Link
    // | NoteReference
    // | InlineNote
    // | Code
    // | RawHtml
    // | Entity
    // | EscapedChar
    // | Smart
    r.Symbol,
  ).map((el) => {
    // TODO: should all the inlines be forced elements?
    if (typeof el === 'string') {
      return {
        type: 'text',
        value: el,
      };
    } else {
      return el;
    }
  });
}

export default Inline;
