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
 * id: 01EWDEKMNCQGJ11JFC71RV9DPG
 * content-type: application/vnd.metanotes.component-jsmodule
 * title: $:core/parser/EmphasisStar
 * tags: ['$:core/parser']
 * parser: EmphasisStar
 */

const { alt, string, eof, notFollowedBy, whitespace, lookahead, Parser, makeSuccess } = components.Parsimmon;


function lookbehind(p, ofs) {
  if (ofs === undefined) {
    ofs = -1;
  }
  return Parser((input, i) => {
    const charI = i - ofs;
    if (charI < 0) {
      return makeSuccess(i, '');
    }
    const res = p._(input, charI);
    res.index = i;
    return res;
  });
}

function EmphasisStar(r) {
  const lfdr = string('*')
    .notFollowedBy(whitespace)
    .then(alt(
      notFollowedBy(r.PunctuationChar),
      lookahead(r.PunctuationChar).then(lookbehind(alt(whitespace, r.PunctuationChar), 2))
    ));

  const rfdr = string('*')
    .notFollowedBy(lookbehind(whitespace, 2))
    .then(alt(
      notFollowedBy(lookbehind(r.PunctuationChar, 2)),
      lookbehind(r.PunctuationChar, 2).lookahead(alt(whitespace, eof, r.PunctuationChar))
    ));
  
  return (
    lfdr
      .then(
        notFollowedBy(rfdr).then(r.Inline).atLeast(1)
      )
      .map(children => ({
        type: 'emphasis',
        children,
      }))
      .skip(rfdr)
  );
}

export default EmphasisStar;
