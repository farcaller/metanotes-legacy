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
 * id: 01F3NN8Q6JQS6B9HDSDKNKRKBA
 * content-type: application/vnd.metanotes.component-jsmodule
 * title: $:core/parser/ListItem
 * tags: ['$:core/parser']
 * parser: ListItem
 */

import { regexp } from '@metascribbles/parsimmon';

function ListItemGeneratorFunc({ rebuildParser }) {
  function ListItem() {
    return regexp(/[^\S\r\n]{0,3}-[^\S\r\n]+/).chain((indentString) => {
      const indent = indentString.trimStart().length;
      return rebuildParser({ indent }).IndentedBlockContent.map((children) => ({
        type: 'listItem',
        children,
      }));
    });
  }
  return ListItem;
}
ListItemGeneratorFunc.generatorFunc = true;

export default ListItemGeneratorFunc;
