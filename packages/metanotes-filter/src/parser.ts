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

import { alt, any, createLanguage, noneOf, oneOf, regexp, seq, seqMap, string, succeed, whitespace } from 'parsimmon';


type CmdletCall = { name: string, flags: { [key: string]: string }, args: (string | number)[] };

const Lang = createLanguage<{
  Keyword: string,
  QuotedString: string,

  CmdletName: string,
  CmdletFlagName: string,
  CmdletFlagValue: string,
  CmdletFlag: { name: string; value: string },
  CmdletCall: CmdletCall,
  CmdletArgument: string|number,

  Pipeline: CmdletCall[],
}>({
  Keyword() {
    return regexp(/[\w]+/);
  },
  QuotedString() {
    return oneOf(`"'`).chain(function (q) {
      return alt(
        noneOf(`\\${q}`)
          .atLeast(1)
          .tie(), // everything but quote and escape sign
        string(`\\`).then(any) // escape sequence like \"
      )
        .many()
        .tie()
        .skip(string(q));
    });
  },

  CmdletName() {
    return regexp(/[A-Za-z][\w-]*/);
  },
  CmdletFlagName(r) {
    return string('-').then(r.Keyword);
  },
  CmdletFlagValue() {
    return regexp(/[^ ]+/);
  },
  CmdletFlag(r) {
    return seqMap(r.CmdletFlagName, whitespace, r.CmdletFlagValue, (name, _, value) => ({ name, value }));
  },
  CmdletArgument(r) {
    return alt(r.Keyword, r.QuotedString);
  },
  CmdletCall(r) {
    return seqMap(
      r.CmdletName,
      alt(
        whitespace.then(seq(
          r.CmdletFlag.sepBy(whitespace),
          r.CmdletArgument.sepBy(whitespace)
        )), succeed<[{ name: string, value: string }[], string[]]>([[], []])),
        (name, a) => {
        const [flagsList, args] = a;
        const flags: { [key: string]: string } = {};
        for (const f of flagsList) {
          if (flags[f.name]) {
            throw `repeated argument '${f.name}'`;
          }
          flags[f.name] = f.value;
        }
        return { name, flags, args };
    });
  },

  Pipeline(r) {
    return r.CmdletCall.sepBy1(string('|').trim(whitespace));
  }
});

export default Lang;
