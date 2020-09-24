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
import * as ast from 'ts-mdast';


export default function(this: unified.Processor): void {
  const parser = this.Parser;

  attachParser(parser);
}

function attachParser(parser: unified.ParserConstructor | unified.ParserFunction) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  parser.prototype.inlineTokenizers.wikiLink = wikiLink;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-call
  parser.prototype.inlineMethods.splice(parser.prototype.inlineMethods.indexOf('reference'), 0, 'wikiLink');
}

const linkRe = /^\[\[((?:[^\]]|\](?!\]))*)\]\]/;

export interface WikiLinkAst extends ast.Node {
  type: 'wikiLink';
  value: string;
};

export function isWikiLink(node: ast.Node): node is WikiLinkAst {
  return node.type === 'wikiLink';
}

function wikiLink(eat: (subvalue: string) => (node: unknown, parent?: unknown) => WikiLinkAst, value: string): WikiLinkAst | undefined | boolean {
  const linkMatch = linkRe.exec(value);
  if (!linkMatch) {
    return;
  }

  return eat(value.slice(0, linkMatch[0].length))({
    type: 'wikiLink',
    value: linkMatch[1],
  });
}

wikiLink.locator = (value: string, fromIndex: number) => {
  return value.indexOf('[', fromIndex);
};
