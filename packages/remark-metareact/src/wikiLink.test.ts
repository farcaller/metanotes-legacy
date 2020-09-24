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

/* eslint-disable @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-assignment */

import unified from 'unified';
import markdown from 'remark-parse';

import wikiLink from './wikiLink';


test('it parses a link', () => {
  const parser = unified()
    .use(markdown)
    .use(wikiLink);
  const node = (parser.parse('[[link]]')).children[0].children[0];

  expect(node.type).toEqual('wikiLink');
  expect(node.value).toEqual('link');
});

test('it parses multiworld link', () => {
  const parser = unified()
    .use(markdown)
    .use(wikiLink);
  const node = (parser.parse('[[link with several whatever words]]')).children[0].children[0];

  expect(node.value).toEqual('link with several whatever words');
});

test('it parses multiworld link non-greedily', () => {
  const parser = unified()
    .use(markdown)
    .use(wikiLink);
  const node = (parser.parse('[[link with several]] whatever words]]')).children[0].children[0];

  expect(node.value).toEqual('link with several');
});
