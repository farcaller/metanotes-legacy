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

import { doParse } from '../parser/test-helpers';

test.skip('It generates the emphasis delimiter runs', () => {
  const n = doParse('***hello* world**', 'Inlines');
  expect(n).toEqual([
    { canClose: false, canOpen: true, end: -1, jump: 0, length: 3, marker: '*', type: 'delimiter_run' },
    { canClose: false, canOpen: true, end: -1, jump: 1, length: 3, marker: '*', type: 'delimiter_run' },
    { canClose: false, canOpen: true, end: -1, jump: 2, length: 3, marker: '*', type: 'delimiter_run' },
    { type: 'text', value: 'hello' },
    { canClose: true, canOpen: false, end: -1, jump: 0, length: 1, marker: '*', type: 'delimiter_run' },
    { type: 'text', value: ' world' },
    { canClose: true, canOpen: false, end: -1, jump: 0, length: 2, marker: '*', type: 'delimiter_run' },
    { canClose: true, canOpen: false, end: -1, jump: 1, length: 2, marker: '*', type: 'delimiter_run' },
  ]);
});

test.skip('It pairs the emphasis delimeter runs', () => {
  const n = doParse('***hello* world**', 'Inlines');
  expect(n.children).toEqual([
    { canClose: false, canOpen: true, end: 5, jump: 0, length: 3, marker: '*', type: 'delimiter_run', originalIdx: 0 },
    { canClose: false, canOpen: true, end: 4, jump: 0, length: 3, marker: '*', type: 'delimiter_run', originalIdx: 1 },
    { canClose: false, canOpen: true, end: 3, jump: 0, length: 3, marker: '*', type: 'delimiter_run', originalIdx: 2 },
    { type: 'text', value: 'hello' },
    { canClose: true, canOpen: false, end: -1, jump: 1, length: 1, marker: '*', type: 'delimiter_run', originalIdx: 4 },
    { type: 'text', value: ' world' },
    { canClose: true, canOpen: false, end: -1, jump: 3, length: 2, marker: '*', type: 'delimiter_run', originalIdx: 6 },
    { canClose: true, canOpen: false, end: -1, jump: 5, length: 2, marker: '*', type: 'delimiter_run', originalIdx: 7 },
  ]);
});

test.skip('It converts delimeter runs into strong/emphasis tags', () => {
  const n = doParse('***hello* world**', 'Inlines');
  expect(n).toEqual([
    {
      type: 'strong',
      children: [
        {
          type: 'emphasis',
          children: [{ type: 'text', value: 'hello' }],
        },
        {
          type: 'text',
          value: ' world',
        },
      ],
    },
  ]);
});
