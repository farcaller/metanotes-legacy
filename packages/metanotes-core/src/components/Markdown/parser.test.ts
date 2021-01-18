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
import remarkHTML from 'remark-html';

import makeParser from './parser';
import { commonmarkTests, parserScribbles, expectParse } from './test-helpers'; 


function testCommonmark(idx: number) {
  test(`it passes the commonmark spec #${idx}`, () => {
    const parser = unified()
      .use(makeParser, { parserScribbles })
      .use(remarkHTML);

    const spec = commonmarkTests[idx];

    const out = parser.processSync(spec.markdown + '\n\n');

    console.log(JSON.stringify(parser.parse(spec.markdown + '\n\n'), null, 2));

    expect(out.contents).toEqual(spec.html);
  });
}

testCommonmark(189);
testCommonmark(191);

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

test('it parses headers', () => {
  expectParse('### hello **there** ###\nworld\n\n',
    [
      {
        type: 'heading',
        depth: 3,
        children: [
          { type: 'text', value: 'hello ' },
          { type: 'strong', children: [{ type: 'text', value: 'there' }] },
        ]
      },
      {
        type: 'paragraph',
        children: [
          { type: 'text', value: 'world' },
        ],
      },
    ]);
});
