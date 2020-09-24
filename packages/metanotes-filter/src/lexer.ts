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

import { createToken, Lexer } from 'chevrotain';

export const Whitespace = createToken({ name: 'Whitespace', pattern: /\s+/, group: Lexer.SKIPPED });
export const Identifier = createToken({ name: 'Identifier', pattern: /[a-zA-Z]\w*/ });
export const Pipe = createToken({ name: 'Pipe', pattern: /\|/ });
export const StringLiteral = createToken({ name: "StringLiteral", pattern: /"(:?[^\\"\n\r]+|\\(:?[bfnrtv"\\/]|u[0-9a-fA-F]{4}))*"/ });
export const NumberLiteral = createToken({ name: "NumberLiteral", pattern: /-?(0|[1-9]\d*)(\.\d+)?([eE][+-]?\d+)?/ });

export const tokens = [
  Whitespace,
  Identifier,
  NumberLiteral,
  StringLiteral,
  Pipe,
];

export default new Lexer(tokens);
