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
 * id: 01F3K8FMD6BDMJFVZQDJWA7G9R
 * content-type: application/vnd.metanotes.component-jsmodule
 * title: $:core/parser/AtxHeading
 * tags: ['$:core/parser']
 * parser: AtxHeading
 */

const { alt, seqMap, regexp, Parser, makeSuccess, makeFailure } = Parsimmon;

const balanceEmphasisChildren = requireScribble('$:core/parser-helpers/balanceEmphasisChildren');
const collapseText = requireScribble('$:core/parser-helpers/collapseText');

const peekPrevWhitespace = Parser((input, i) => {
  if (input[i - 1].match(/[^\S\r\n]/)) {
    return makeSuccess(i, input[i - 1]);
  }
  return makeFailure(i, '[space]');
});

function AtxHeading(r) {
  return alt(
    seqMap(regexp(/ {0,3}#{1,6}/), r.Space, alt(
      peekPrevWhitespace
        .then(regexp(/[^\S\r\n]*#+[^\S\r\n]*/))
        .map((value) => ({ type: 'text', value, closingRun: true })),
      r.PhrasingContent,
    ).many(), (heading, _, phrasingContent) => {
      const el = {
        type: 'heading',
        depth: heading.trim().length,
        children: phrasingContent.flat(),
      };
      balanceEmphasisChildren(el);

      let hasChildren = el.children.length > 0;
      let lastChild = hasChildren ? el.children[el.children.length - 1] : undefined;
      if (hasChildren && lastChild.type === 'text' && lastChild.closingRun) {
        el.children.pop();
      }
      collapseText(el);

      hasChildren = el.children.length > 0;
      lastChild = hasChildren ? el.children[el.children.length - 1] : undefined;
      if (hasChildren) {
        if (lastChild.type === 'text') {
          lastChild.value = lastChild.value.trimEnd();
        }
      }
      return el;
    }),
    regexp(/ {0,3}#{1,6}/).lookahead('\n').map((heading) => ({
      type: 'heading',
      depth: heading.trim().length,
      noText: true,
      children: [],
    })),
  );
}

export default AtxHeading;
