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

/* eslint-disable @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-assignment */

import lexer from './lexer';


test('it lexes an identifier', () => {
  const result = lexer.tokenize(`identifier`);

  expect(result.tokens[0].tokenType.name).toEqual('Identifier');
  expect(result.errors).toHaveLength(0);
});

test('it lexes a call to filter function', () => {
  const result = lexer.tokenize(`get_by_id doc1 "doc2"`);

  expect(result.errors).toHaveLength(0);
  const tokenNames = result.tokens.map(t => t.tokenType.name);
  expect(tokenNames).toEqual(['Identifier', 'Identifier', 'StringLiteral']);
});

test('it lexes a chained call', () => {
  const result = lexer.tokenize(`get_by_id doc1 | tags`);

  expect(result.errors).toHaveLength(0);
  const tokenNames = result.tokens.map(t => t.tokenType.name);
  expect(tokenNames).toEqual(['Identifier', 'Identifier', 'Pipe', 'Identifier']);
});
