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
import remarkHTML from 'remark-html';

import makeParser from './parser';
import { commonmarkTests, doParse, parserScribbles } from './test-helpers'; 

// TODO: dedup
function testCommonmark(idx: number) {
  test(`it passes the commonmark spec #${idx}`, () => {
    const parser = unified()
      .use(makeParser, { parserScribbles })
      .use(remarkHTML);

    const spec = commonmarkTests[idx];
    const out = parser.processSync(spec.markdown + '\n\n');
    expect(out.contents).toEqual(spec.html);
  });
}

test('Str matches at least one normal character', () => {
  const n = doParse('hello', 'Str');
  expect(n).toEqual({
    type: 'text',
    value: 'hello',
  });
});

test('Str doesn\'t match newlines', () => {
  expect(() => doParse('newlines\n', 'Str')).toThrow();
});

test('Str doesn\'t match spaces', () => {
  expect(() => doParse('two words', 'Str')).toThrow();
});

test('Str doesn\'t match special chars', () => {
  expect(() => doParse('*', 'Str')).toThrow();
});


test('Endline matches line breaks', () => {
  const n = doParse('  \n', 'Endline');
  expect(n).toEqual({
    type: 'break',
  });
});

test('Endline matches the very final newline', () => {
  const n = doParse('\n', 'Endline');
  expect(n).toEqual('\n');
});

test('Endline matches the very final newline trimming trailing spaces', () => {
  const n = doParse('\t \t \n', 'Endline');
  expect(n).toEqual('\n');
});

test('NormalEndline matches normal endlines', () => {
  const n = doParse('\n', 'NormalEndline');
  expect(n).toEqual('\n');
});

test('NormalEndline matches normal endlines unless they are followed by block starters', () => {
  expect(() => doParse('\n\n', 'NormalEndline')).toThrow();
  expect(() => doParse('\n> quote', 'NormalEndline')).toThrow();
  expect(() => doParse('\n# header', 'NormalEndline')).toThrow();
  expect(() => doParse('\nheader\n------', 'NormalEndline')).toThrow();
  expect(() => doParse('\nheader\n======', 'NormalEndline')).toThrow();
});


test('Space matches all the spaces/tabs', () => {
  const n = doParse('\t \t ', 'Space');
  expect(n).toEqual({
    type: 'text',
    value: '\t \t ',
  });
});


test('Strong matches text in **stars**', () => {
  const n = doParse('**hello**', 'Strong');
  expect(n).toEqual({
    type: 'strong',
    children: [{
      type: 'text',
      value: 'hello',
    }]
  });
});

test('Strong matches text in **stars** with nested inlines', () => {
  const n = doParse('**hello *the* world**', 'Strong');
  expect(n).toEqual({
    type: 'strong',
    children: [{
      type: 'text',
      value: 'hello ',
    }, {
      type: 'emphasis',
      children: [{
        type: 'text',
        value: 'the',
      }]
    }, {
      type: 'text',
      value: ' world',
    }]
  });
});


test('Emphasis matches text in *stars*', () => {
  const n = doParse('*hello*', 'Emphasis');
  expect(n).toEqual({
    type: 'emphasis',
    children: [{
      type: 'text',
      value: 'hello',
    }]
  });
});

test('Emphasis matches text in _underscores_', () => {
  const n = doParse('_hello_', 'Emphasis');
  expect(n).toEqual({
    type: 'emphasis',
    children: [{
      type: 'text',
      value: 'hello',
    }]
  });
});

testCommonmark(350);
testCommonmark(351);
// TODO: testCommonmark(352);
// TODO: testCommonmark(353);
testCommonmark(354);
testCommonmark(355);
testCommonmark(356);
testCommonmark(357);
// TODO: testCommonmark(358);
// TODO: testCommonmark(359);
// TODO: testCommonmark(360);
// TODO: testCommonmark(361);
// TODO: testCommonmark(362);
testCommonmark(363);
testCommonmark(364);
// TODO: testCommonmark(365);
// TODO: testCommonmark(366);
// TODO: testCommonmark(367);
testCommonmark(368);

test('Symbol matches special characters', () => {
  const n = doParse('*', 'Symbol');
  expect(n).toEqual({
    type: 'text',
    value: '*',
  });
});
