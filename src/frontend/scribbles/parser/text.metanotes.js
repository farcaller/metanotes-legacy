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
 * id: 01F3JXEXM8TGWWRQBZ5VK4MJVT
 * content-type: application/vnd.metanotes.component-jsmodule
 * title: $:core/parser/Text
 * tags: ['$:core/parser']
 * parser: Text
 */

const { regexp } = Parsimmon;

function Text() {
  return regexp(/[^#_*\s\\]+/).map((value) => ({
    type: 'text',
    value,
  }));
}

export default Text;
