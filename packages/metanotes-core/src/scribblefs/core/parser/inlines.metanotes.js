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
 * id: 01ER0AXKPQ42H5H58YVQXGB560
 * content-type: application/vnd.metanotes.component-jsmodule
 * title: $:core/parser/Inlines
 * tags: ['$:core/parser']
 * parser: Inlines
 */

function Inlines(r) {
  return r.Inline.atLeast(1).map(ii => ii.reduce((out, curr) => {
    if (typeof curr === 'string') {
      if (out.length === 0) {
        out.push({
          type: 'text',
          value: curr,
        });
      } else {
        let last = out[out.length - 1];
        if (last.type === 'text') {
          last.value += curr;
        } else {
          out.push({
            type: 'text',
            value: curr,
          });
        }
      }
    } else {
      out.push(curr);
    }
    return out;
  }, []));
}

export default Inlines;
