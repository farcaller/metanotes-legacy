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

import { SyncedScribble } from '../scribble';
import { loadJsModule } from './jsmodLoader';

export function loadScribbleComponentModule(scribble: SyncedScribble, components: { [key: string]: React.FunctionComponent<unknown> }): React.FunctionComponent<unknown> {
  switch (scribble.attributes['content-type']) {
    case 'application/vnd.metanotes.component-jsmodule':
      return loadJsModule(scribble, components);
    default:
      throw Error(`unsupported mime type for component scribble ${scribble.id}: ${scribble.attributes['content-type']}`);
  }
}
