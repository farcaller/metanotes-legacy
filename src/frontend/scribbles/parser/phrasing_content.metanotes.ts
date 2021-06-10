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
 * id: 01F3JXCM0W6GZT3NB9Z1E2PWY9
 * content-type: application/vnd.metanotes.component-jsmodule
 * title: $:core/parser/PhrasingContent
 * tags: ['$:core/parser']
 * parser: PhrasingContent
 */

import { alt } from '@metascribbles/parsimmon';

function PhrasingContent(r) {
  return alt(
    r.StaticPhrasingContent,
  );
}

export default PhrasingContent;
