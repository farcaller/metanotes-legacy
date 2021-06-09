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
 * id: 01ETZSR0FPW8KQ1ZEQKNYSJ5WQ
 * content-type: application/vnd.metanotes.component-jsmodule
 * title: $:core/parser/Block
 * tags: ['$:core/parser']
 * parser: Block
 */

const { alt } = Parsimmon;

function Block(r) {
  return r.BlankLine.many().then(alt(
    // | BlockQuote
    // | Verbatim
    // | Note
    // | Reference
    // | HorizontalRule
    r.Heading,
    // | OrderedList
    // | BulletList
    // | HtmlBlock
    // | StyleBlock
    r.Paragraph,
    // | Plain
  ));
}

export default Block;
