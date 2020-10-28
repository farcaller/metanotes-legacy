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


const openTagRe = /^{{(\/)?(\w+)\s*/;
const closeTagRe = /^(\/)?}}/;
// https://stackoverflow.com/questions/249791/regex-for-quoted-string-with-escaping-quotes
const paramRe = /^(\w+)\s*=\s*(\w+|"(?:[^"\\]|\\.)*")\s*/;

export interface InlineTagAst extends ast.Parent {
  type: 'mjtag';
  tagName: string;
  params: {[key: string]: string};
  closing: boolean;
  selfClosing: boolean;
};

export function isInlineTag(node: ast.Node): node is InlineTagAst {
  return node.type === 'mjtag';
}

function inlineTag(eat: (subvalue: string) => (node: unknown, parent?: unknown) => InlineTagAst, value: string): InlineTagAst | undefined | boolean {
  const openTagMatch = openTagRe.exec(value);
  if (!openTagMatch) {
    return;
  }

  const params: {[key: string]: string} = {};

  const openTag = openTagMatch[2];
  const closing = openTagMatch[1] === '/';
  const length = value.length;
  let selfClosing = false;
  let index = openTagMatch[0].length;
  let subvalue = value;

  while (index < length) {
    subvalue = value.slice(index);
    const closeTagMatch = closeTagRe.exec(subvalue);
    if (closeTagMatch) {
      index += closeTagMatch[0].length;
      selfClosing = closeTagMatch[1] === '/';
      break;
    }
    const paramMatch = paramRe.exec(subvalue);
    if (paramMatch) {
      index += paramMatch[0].length;
      let paramValue = paramMatch[2];
      if (paramValue.startsWith('"')) {
        paramValue = paramValue.substr(1, paramValue.length-2);
      }
      params[paramMatch[1]] = paramValue;
      continue;
    }
    // if we're here then it's neither the tag closing nor the param. thus it's not a tag at all
    return;
  }

  if (closing && selfClosing) {
    return;
  }

  // TODO: this can't actually have children
  return eat(value.slice(0, index))({
    type: 'mjtag',
    tagName: openTag,
    params,
    closing,
    selfClosing,
  });
}

inlineTag.locator = (value: string, fromIndex: number) => {
  return value.indexOf('{', fromIndex);
};

function attachParser(parser: unified.ParserConstructor | unified.ParserFunction) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  parser.prototype.inlineTokenizers.mjtag = inlineTag;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-call
  parser.prototype.inlineMethods.unshift('mjtag');
}

export default function (this: unified.Processor): void {
  const parser = this.Parser;

  attachParser(parser);
}
