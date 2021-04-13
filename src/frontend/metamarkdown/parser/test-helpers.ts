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
import { Node } from 'unist';
import * as mdast from 'ts-mdast';
import * as commonmarkSpec from 'commonmark-spec';
import { autorun } from 'mobx';

import makeParser from './parser';
import coreScribbles from '../../scribbles';
import Scribble from '../../store/scribble/scribble';
import { CoreScribble } from '../../store/interface/core_scribble';
import { balancerTransformer } from '../ast/emphasis_transformer';
import { concatTransformer } from '../ast/concat_transformer';

const ParserScribblesPrefix = '$:core/parser/';

function loadScribbles(scribbles: CoreScribble[]) {
  const scribsByName = {} as { [key: string]: Scribble };
  for (const coreScribble of scribbles) {
    if (coreScribble.title?.startsWith(ParserScribblesPrefix)) {
      const title = coreScribble.title.slice(ParserScribblesPrefix.length);
      scribsByName[title] = Scribble.fromCoreScribble(coreScribble);
    }
  }
  return scribsByName;
}

export const parserScribbles = loadScribbles(coreScribbles);
autorun(() => {
  for (const scribble of Object.values(parserScribbles)) {
    scribble.JSModule();
  }
});
const rootParsers = {} as { [k: string]: unified.Processor<unified.Settings> };

export function doParse(doc: string, rootNode = 'Document'): mdast.Node {
  if (rootParsers[rootNode] === undefined) {
    const parser = unified()
      .use(makeParser, { parserScribbles, rootNode })
      .use(balancerTransformer)
      .use(concatTransformer as never);
    rootParsers[rootNode] = parser;
  }
  const parser = rootParsers[rootNode];

  let node = parser.parse(doc);
  node = parser.runSync(node);

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
