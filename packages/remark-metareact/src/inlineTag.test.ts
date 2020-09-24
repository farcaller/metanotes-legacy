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

import inlineTag from './inlineTag';

test('it parses a tag', () => {
  const parser = unified()
    .use(markdown)
    .use(inlineTag);
  const node = (parser.parse('{{hello}}')).children[0].children[0];

  expect(node.type).toEqual('mjtag');
});

test('it parses the tag name', () => {
  const parser = unified()
    .use(markdown)
    .use(inlineTag);
  const node = (parser.parse('{{hello}}')).children[0].children[0];

  expect(node.tagName).toEqual('hello');
});

test('it parses a closing tag', () => {
  const parser = unified()
    .use(markdown)
    .use(inlineTag);
  const node = (parser.parse('{{/hello}}')).children[0].children[0];

  expect(node.tagName).toEqual('hello');
  expect(node.closing).toEqual(true);
});

test('it parses a self-closing tag', () => {
  const parser = unified()
    .use(markdown)
    .use(inlineTag);
  const node = (parser.parse('{{hello/}}')).children[0].children[0];

  expect(node.tagName).toEqual('hello');
  expect(node.selfClosing).toEqual(true);
});

test("it desn't parse a closing self-closing tag", () => {
  const parser = unified()
    .use(markdown)
    .use(inlineTag);
  const node = (parser.parse('{{/hello/}}')).children[0].children[0];

  expect(node.type).toEqual('text');
});

test('it parses params', () => {
  const parser = unified()
    .use(markdown)
    .use(inlineTag);
  const node = (parser.parse('{{hello a=b c="d"}}')).children[0].children[0];

  expect(node.params).toHaveProperty('a', 'b');
  expect(node.params).toHaveProperty('c', 'd');
});

test('it parses two tags', () => {
  const parser = unified()
    .use(markdown)
    .use(inlineTag);
  const node = (parser.parse('{{hello a=b}}{{ohai c=d}}')).children[0];

  expect(node.children[0].tagName).toEqual('hello');
  expect(node.children[1].tagName).toEqual('ohai');
});
