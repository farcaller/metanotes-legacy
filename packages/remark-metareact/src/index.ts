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
import markdown from 'remark-parse';
import * as ast from 'ts-mdast';

import { metaCompiler } from './compiler';
import { Components } from './components';
import inlineTag from './inlineTag';
import wikiLink from './wikiLink';
export { Components, HeadingProps, ListProps, ListItemProps, TableProps, CodeProps, InlineCodeProps, ImageProps, WikiLinkProps, LinkProps } from './components';

const inlineHTML = () => false;
inlineHTML.locator = () => -1;

// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-explicit-any
(markdown.Parser.prototype as any).blockTokenizers.html = () => false;
// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-explicit-any
(markdown.Parser.prototype as any).inlineTokenizers.html = inlineHTML;

export const compile = (doc: string, components: Components, inline: boolean): JSX.Element => {
  const parser = unified()
    .use(markdown)
    .use(inlineTag)
    .use(wikiLink)
    .use(metaCompiler, { components, inline });

  const f = parser.processSync({ contents: doc });
  return f.result as JSX.Element;
};

export const parse = (doc: string): ast.Node => {
  const parser = unified()
    .use(markdown)
    .use(inlineTag);

  return parser.parse({ contents: doc });
};
