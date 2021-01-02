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

import { Processor } from 'unified';
import { VFile } from 'vfile';
import * as mdast from 'ts-mdast';
import Parsimmon, { Language, Parser } from 'parsimmon';
import { Scribble, loadJsModule, SyncedScribble } from '@metanotes/store/lib/features/scribbles';
import * as P from 'parsimmon';


function buildParser(parserScribbles: { [key: string]: Scribble }, rootNode: string): Parsimmon.Parser<mdast.Root> {
  const parserFuncs = {} as { [key: string]: (r: Language) => Parser<never> };
  for (const k of Object.keys(parserScribbles)) {
    parserFuncs[k] = loadJsModule(parserScribbles[k] as SyncedScribble, { Parsimmon: P } as any) as unknown as (r: Language) => Parser<never>;
  }
  // TODO: see https://stackoverflow.com/questions/994143/javascript-getter-for-all-properties for better errors
  return Parsimmon.createLanguage(parserFuncs)[rootNode] as Parsimmon.Parser<mdast.Root>;
}

function parse(text: string, _file: VFile, parserScribbles: { [key: string]: Scribble }, rootNode: string): mdast.Root {
  const rootParser = buildParser(parserScribbles, rootNode);
  return rootParser.tryParse(text);
}

export interface ParseOptions {
  parserScribbles: { [key: string]: Scribble };
  rootNode?: string;
};

function makeParser(this: Processor, options: ParseOptions): void {
  const rootNode = options.rootNode || 'Document';
  this.Parser = (text, file) => parse(text, file, options.parserScribbles, rootNode);
}

makeParser.settings = {};

export default makeParser;
