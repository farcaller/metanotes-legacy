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

import unified, { Attacher, Settings } from 'unified';
import * as ast from 'ts-mdast';

import { metaCompiler } from './compiler';
import { Components } from './components';
import { ParserOptions } from '../parser/types';
import { Scribble } from '../../store/features/scribbles';
import { balancerTransformer } from './emphasis_transformer';
import { concatTransformer } from './concat_transformer';

export function buildParser(
  metaParser: Attacher<[ParserOptions], Settings>,
  options: ParserOptions,
  emitJSX: boolean,
  components?: Components,
  inline?: boolean,
): unified.Processor {
  const parser = unified()
    .use(metaParser, options)
    .use(balancerTransformer)
    .use(concatTransformer as never);
  if (emitJSX) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    parser.use(metaCompiler, { components: components!, inline: inline === true });
  }

  return parser;
}

export const compile = (
  doc: string,
  components: Components,
  inline: boolean,
  metaParser: Attacher<[ParserOptions], Settings>,
  metaScribbles: { [key: string]: Scribble },
): JSX.Element => {
  const parser = buildParser(metaParser, { parserScribbles: metaScribbles }, false, components, inline);

  const f = parser.processSync({ contents: doc });
  return f.result as JSX.Element;
};

export const parse = (
  doc: string,
  components: Components,
  inline: boolean,
  metaParser: Attacher<[ParserOptions], Settings>,
  options: ParserOptions,
): ast.Node => {
  const parser = buildParser(metaParser, options, false, components, inline);

  let node = parser.parse(doc);
  node = parser.runSync(node);

  return node;
};
