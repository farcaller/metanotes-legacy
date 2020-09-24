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

// TODO: chevrotain is extremely type unsafe
/* eslint-disable @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-return,@typescript-eslint/no-explicit-any */

import { EmbeddedActionsParser } from 'chevrotain';

import * as l from './lexer';
import * as ast from './ast';


class FilterParser extends EmbeddedActionsParser {
  constructor() {
    super(l.tokens);

    const $ = this as any;

    $.RULE('argument', () => $.OR([
        { ALT: () => $.CONSUME(l.Identifier).image },
        { ALT: () => {
          const stringLiteral = $.CONSUME(l.StringLiteral).image;
          return stringLiteral.substr(1, stringLiteral.length - 2);
        } },
        { ALT: () => Number($.CONSUME(l.NumberLiteral).image) },
      ])
    );

    $.RULE('arguments', () => {
      const args: any[] = [];
      $.MANY(() => { args.push($.SUBRULE($.argument)); });
      return args;
    });

    $.RULE('call', (): ast.Call => ({
      functionName: $.CONSUME(l.Identifier).image,
      arguments: $.SUBRULE($.arguments),
    }));

    $.RULE('pipeline', (): ast.Pipeline => {
      const calls: ast.Call[] = [];
      $.AT_LEAST_ONE_SEP({
        SEP: l.Pipe,
        DEF: () => {
          calls.push($.SUBRULE($.call));
        }
      });
      return { calls };
    });

    $.RULE('filter', (): ast.Pipeline => $.SUBRULE($.pipeline));

    this.performSelfAnalysis();
  }
}

const parser = new FilterParser();

export default parser;
