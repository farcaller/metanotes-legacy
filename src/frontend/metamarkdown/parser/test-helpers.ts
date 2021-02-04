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
// eslint-disable-next-line import/no-extraneous-dependencies
import { Parent, Node } from 'unist';
import * as mdast from 'ts-mdast';
import compact from 'mdast-util-compact';
import * as commonmarkSpec from 'commonmark-spec';

import makeParser from './parser';
import allScribbles from '../../scribbles';
import { Scribble } from '../../store/features/scribbles';

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

// TODO: forced typecast
export const parserScribbles = loadScribbles(allScribbles as Scribble[]);
const rootParsers = {} as { [k: string]: unified.Processor<unified.Settings> };

export function doParse(doc: string, rootNode?: string): mdast.Node {
  if (rootNode === undefined) {
    // eslint-disable-next-line no-param-reassign
    rootNode = 'Document';
  }
  if (rootParsers[rootNode] === undefined) {
    const parser = unified()
      .use(makeParser, { parserScribbles, rootNode });
    rootParsers[rootNode] = parser;
  }
  const parser = rootParsers[rootNode];

  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  const node = compact((parser.parse(doc))) as Parent;

  return node;
}

type TestSpec = {
  markdown: string;
  html: string;
  section: string;
  number: number;
};

function loadCommonmarkTests(): TestSpec[] {
  const tests: TestSpec[] = [];
  for (let i = 0; i < (commonmarkSpec as { tests: TestSpec[] }).tests.length; ++i) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    tests.push((commonmarkSpec as { tests: TestSpec[] }).tests.find((s) => s.number === i)!);
  }
  return tests;
}

export const commonmarkTests = loadCommonmarkTests();

export function expectParse(doc: string, expected: Node[]): void {
  const node = doParse(doc);

  expect(node).toEqual({
    type: 'root',
    children: expected,
  });
}
