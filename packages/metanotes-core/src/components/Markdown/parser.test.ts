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
import { Parent } from 'unist';
import * as mdast from 'ts-mdast';

import makeParser from './parser';
import scribbles from '../../scribblefs';
import { Scribble } from '@metanotes/store/lib/features/scribbles';

const ParserScribblesPrefix = '$:core/parser/';

function loadScribbles(scribbles: Scribble[]) {
  const scribsByName = {} as { [key: string]: Scribble };
  for (const sc of scribbles) {
    if (sc.attributes.title?.startsWith(ParserScribblesPrefix)) {
      const title = sc.attributes.title.slice(ParserScribblesPrefix.length);
      scribsByName[title] = sc;
    }
  }
  return scribsByName;
}

const parserScribbles = loadScribbles(scribbles);

test('it parses a paragraph', () => {
  const parser = unified()
    .use(makeParser, { parserScribbles });
  const node = (parser.parse('hello world\n\n')) as Parent;

  const paraNode = node.children[0] as Parent;
  expect(paraNode.type).toEqual('paragraph');
  const textNode = paraNode.children[0] as mdast.Text;
  expect(textNode.type).toEqual('text');
  expect(textNode.value).toEqual('hello world');
});
