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
import * as mdast from 'ts-mdast';
import Parsimmon, { Language, Parser } from 'parsimmon';
import { Scribble } from '../../store/interface/scribble';

/**
 * Builds the Parsimmon language from the passed in scribbles.
 *
 * @param parserScribbles Array of scribbles for the parser. Each scribble must
 *                        export the default function that is the parser implementation.
 * @returns Parsimmon Language.
 */
export function buildLanguage(parserScribbles: Scribble[]): Parsimmon.Language {
  type ParserFunc = (r: Language) => Parser<never>;

  const parserFuncs = {} as { [key: string]: ParserFunc };
  for (const scribble of parserScribbles) {
    const parserName = scribble.latestStableVersion.getMeta('parser');
    if (parserName === undefined) {
      console.warn(`scribble ${scribble} doesn't have the parser name set, ignoring.`);
      continue;
    }
    parserFuncs[parserName] = scribble.JSModule<ParserFunc>();
  }
  return Parsimmon.createLanguage(parserFuncs);
}

export interface ParseOptions {
  parserScribbles: Scribble[];
  rootNode?: string;
}

function makeParser(this: Processor, options: ParseOptions): void {
  const rootNode = options.rootNode || 'Document';
  const rootParser = buildLanguage(options.parserScribbles)[rootNode] as Parsimmon.Parser<mdast.Root>;

  this.Parser = (text) => rootParser.tryParse(text);
}

makeParser.settings = {};

export default makeParser;
