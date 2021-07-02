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

import unified from 'unified';

import Scribble from '../../store/scribble/scribble_interface';
import makeParser from '../parser/parser';
import makeCompiler from './compiler';
import Components from './components';

export default function render(
  contents: string,
  inline: boolean,
  parserScribbles: Scribble[],
  components: Components,
): JSX.Element {
  const parser = unified()
    .use(makeParser, { parserScribbles })
    .use(makeCompiler, { components, inline });

  const f = parser.processSync({ contents });
  return (f.result as any).jsx as JSX.Element;
}
