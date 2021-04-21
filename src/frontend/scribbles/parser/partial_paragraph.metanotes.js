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
 * id: 01F3JX7YEA0KH4F1HT07KWE9A8
 * content-type: application/vnd.metanotes.component-jsmodule
 * title: $:core/parser/PartialParagraph
 * tags: ['$:core/parser']
 * parser: PartialParagraph
 */

const { string } = Parsimmon;

function removeWhitespace(phrasingContents) {
  const len = phrasingContents.length;
  if (len === 0) {
    return phrasingContents;
  }
  if (phrasingContents[0].type === 'text') {
    phrasingContents[0].value = phrasingContents[0].value.trimStart();
  }
  if (phrasingContents[len - 1].type === 'text') {
    phrasingContents[len - 1].value = phrasingContents[len - 1].value.trimEnd();
  }
  return phrasingContents;
}

function generateBreaks(phrasingContents) {
  const len = phrasingContents.length;
  if (len > 0 && phrasingContents[len - 1].type === 'text') {
    const el = phrasingContents[len - 1];
    if (el.value.endsWith('  ')) {
      el.value = el.value.trimEnd();
      phrasingContents.push({
        type: 'break',
      });
      return phrasingContents;
    }
    if (el.value.endsWith('\\')) {
      el.value = el.value.slice(0, -1).trimEnd();
      phrasingContents.push({
        type: 'break',
        isBackslash: true,
      });
      return phrasingContents;
    }
  }
  return phrasingContents;
}

function PartialParagraph(r) {
  return r.PhrasingContent.many().skip(string('\n')).map((phrasingContents) => {
    const children = removeWhitespace(generateBreaks(phrasingContents).flat());
    if (children.length > 0) {
      return {
        type: 'partial_paragraph',
        children,
      };
    }
    return { type: 'empty_line' };
  });
}

export default PartialParagraph;
