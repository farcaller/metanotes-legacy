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
 * id: 01EY0PME5SZ3BNJ3SV2EDENVR8
 * content-type: application/vnd.metanotes.component-jsmodule
 * title: $:core/parser/Link
 * tags: ['$:core/parser']
 * parser: Link
 */

const { alt, succeed, seqObj, string, whitespace, optWhitespace, regexp } = components.Parsimmon;

function Link(r) {
  return seqObj(
    string('['),
    ['children', regexp(/[^\]]*/)],
    string(']('),
    ['url', r.LinkDestination.fallback(null)],
    [
      'title',
      alt(
        whitespace.then(r.LinkTitle).skip(optWhitespace),
        succeed(null),
      ),
    ],
    string(')'),
  ).map((link) => ({
    type: 'link',
    url: link.url === null ? '' : link.url,
    title: link.title === null ? undefined : link.title,
    children: r.Inlines.tryParse(link.children),
  }));
}

export default Link;
