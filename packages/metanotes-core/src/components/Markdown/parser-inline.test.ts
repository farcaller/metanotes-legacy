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

import { doParse } from './test-helpers'; 


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

test.skip('Strong matches text in **stars** with nested inlines', () => {
  const n = doParse('**hello! world~**', 'Strong');
  // TODO: implement
});


test('Symbol matches special characters', () => {
  const n = doParse('*', 'Symbol');
  expect(n).toEqual({
    type: 'text',
    value: '*',
  });
});