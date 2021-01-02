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

import unified, { ProcessorSettings, Settings } from 'unified';
import markdown from 'remark-parse';
import * as ast from 'ts-mdast';

import { metaCompiler } from './compiler';
import { Components } from './components';
export { Components, HeadingProps, ListProps, ListItemProps, TableProps, CodeProps, InlineCodeProps, ImageProps, WikiLinkProps, LinkProps } from './components';


// TODO: fix that any type
export const compile = (doc: string, components: Components, inline: boolean, metaParser: any, metaScribbles: unknown): JSX.Element => {
  const parser = unified()
    .use(metaParser, { parserScribbles: metaScribbles })
    .use(metaCompiler, { components, inline });

  const f = parser.processSync({ contents: doc });
  return f.result as JSX.Element;
};

export const parse = (doc: string, components: Components, inline: boolean, metaParser: any, options: unknown): ast.Node => {
  const parser = unified()
    .use(metaParser, options);

  const f = parser.parse(doc);
  return f;
};
