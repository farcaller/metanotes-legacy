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

/* eslint jest/expect-expect: ["error", { "assertFunctionNames": ["expect", "expectParse"] }] */

import unified from 'unified';
import { Parent, Node } from 'unist';
import * as mdast from 'ts-mdast';
import compact from 'mdast-util-compact';

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

function expectParse(doc: string, expected: Node[]) {
  const parser = unified()
    .use(makeParser, { parserScribbles });
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  const node = compact((parser.parse(doc))) as Parent;

  expect(node).toEqual({
    type: 'root',
    children: expected,
  });
}

test('it parses a paragraph', () => {
  expectParse('hello world\n\n',
  [
    {
      type: 'paragraph',
      children: [
        { type: 'text', value: 'hello world' },
      ],
    },
  ]);
});

test('it parses strong text', () => {
  expectParse('hello **world**\n\n',
  [
    {
      type: 'paragraph',
      children: [
        { type: 'text', value: 'hello ' },
        { type: 'strong', children: [{ type: 'text', value: 'world' }] },
      ],
    },
  ]);
});

test('it parses broken strong text', () => {
  expectParse('hello **world\n\n',
    [
      {
        type: 'paragraph',
        children: [
          { type: 'text', value: 'hello **world' },
        ],
      },
    ]);
});

test('it parses broken strong text 2', () => {
  expectParse('hello **  world  **\n\n',
    [
      {
        type: 'paragraph',
        children: [
          { type: 'text', value: 'hello **  world  **' },
        ],
      },
    ]);
});
