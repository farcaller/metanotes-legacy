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

import React from 'react';
import { html } from 'htm/react';

import { SyncedScribble } from '../scribble';

export function loadJsFunction(sc: SyncedScribble, _components: { [key: string]: React.FunctionComponent<unknown> }): React.FunctionComponent<unknown> {
  let funcBody = 'const f = function(props) {\n';
  funcBody += sc.body;
  funcBody += '\n};\n';
  if (sc.attributes['component-name']) {
    funcBody += `f.displayName = ${sc.attributes['component-name']};\n`;
  }
  funcBody += 'return f';
  // eslint-disable-next-line @typescript-eslint/no-implied-eval
  const el = new Function('html', funcBody)(html) as React.FunctionComponent<unknown>;
  return el;
}
