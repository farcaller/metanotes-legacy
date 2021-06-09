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
import * as P from 'parsimmon';
import { Scribble } from '../../store/interface/scribble';

export function buildLanguage(parserScribbles: { [key: string]: Scribble }): Parsimmon.Language {
  const parserFuncs = {} as { [key: string]: (r: Language) => Parser<never> };
  for (const k of Object.keys(parserScribbles)) {
    parserFuncs[k] = parserScribbles[k].JSModule<(r: Language) => Parser<never>>();
  }
  // TODO: see https://stackoverflow.com/questions/994143/javascript-getter-for-all-properties for better errors
  return Parsimmon.createLanguage(parserFuncs);
}

export interface ParseOptions {
  parserScribbles: { [key: string]: Scribble };
  rootNode?: string;
}

function makeParser(this: Processor, options: ParseOptions): void {
  const rootNode = options.rootNode || 'Document';
  const rootParser = buildLanguage(options.parserScribbles)[rootNode] as Parsimmon.Parser<mdast.Root>;

  this.Parser = (text) => rootParser.tryParse(text);
}

makeParser.settings = {};

export default makeParser;
