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
 * id: 01EY0X5BS9CW6EGZK0JF66NT0H
 * content-type: application/vnd.metanotes.component-jsmodule
 * title: $:core/parser/LinkDestination
 * tags: ['$:core/parser']
 * parser: LinkDestination
 */

const { alt, string, Parser, regexp, makeSuccess, makeFailure } = components.Parsimmon;

const WhitespaceRegex = /^\s/;
const EscapedChars = '\\!"#$%&\'()*+,./:;<=>?@[]^_`{|}~-';

const DestinationParser = Parser((input, startIdx) => {
  const len = input.length;
  let depth = 0;
  let i = startIdx;

  if (input[i] === '<') {
    return makeFailure(
      startIdx,
      `unexpected '<' when checking for the link destination`,
    );
  }

  let s = '';

  for (; i < len; ++i) {
    const ch = input[i];
    if (WhitespaceRegex.test(ch) === true) {
      if (i - startIdx === 0) {
        return makeFailure(
          startIdx,
          'unexpected whitespace when checking for the link destination',
        );
      }
      return makeSuccess(i, input.substr(startIdx, i - startIdx));
    }
    switch (ch) {
      case '\\':
        if (EscapedChars.includes(input[i + 1])) {
          ++i;
          s += input[i];
        } else {
          s += '\\';
        }
        break;
      case '(':
        s += ch;
        ++depth;
        break;
      case ')':
        if (depth === 0) {
          return makeSuccess(i, s);
        }
        s += ch;
        --depth;
        if (depth < 0) {
          return makeFailure(i, `unbalanced ')'`);
        }

        break;
      default:
        s += ch;
    }
  }

  if (depth > 0) {
    return makeFailure(startIdx, `unbalanced ')'`);
  }
  if (s.length === 0) {
    return makeFailure(startIdx, 'empty link');
  }
  return makeSuccess(i, s);
});

function LinkDestination(r) {
  return alt(
    string('<').then(regexp(/(?:[^\n<>\\]|\\.)*/)).skip(string('>')),
    DestinationParser,
  );
}

export default LinkDestination;
