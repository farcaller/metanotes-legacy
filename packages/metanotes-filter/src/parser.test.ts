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

/* eslint-disable @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-return */

import Lang from './parser';


test('it parses a cmdlet call', () => {
  const a = Lang.CmdletCall.tryParse(`Get-Scribbles`);

  expect(a).toEqual({
    name: 'Get-Scribbles',
    flags: {},
    args: [],
  });
});

test('it parses a cmdlet call with a named arg', () => {
  const a = Lang.CmdletCall.tryParse(`Get-Scribble -Name hello`);

  expect(a).toEqual({
    name: 'Get-Scribble',
    flags: {
      Name: 'hello',
    },
    args: [],
  });
});

test('it parses a cmdlet call with several named args', () => {
  const a = Lang.CmdletCall.tryParse(`Get-Scribble -Name hello -Core true`);

  expect(a).toEqual({
    name: 'Get-Scribble',
    flags: {
      Name: 'hello',
      Core: 'true',
    },
    args: [],
  });
});

test('it fails to parse a cmdlet call with repeated named arg', () => {
  expect(() => Lang.CmdletCall.tryParse(`Get-Scribble -Name hello -Name true`)).toThrow(`repeated argument 'Name'`);
});

test('it parses a cmdlet call with a positional arg', () => {
  const a = Lang.CmdletCall.tryParse(`Get-Attribute 'content-type'`);

  expect(a).toEqual({
    name: 'Get-Attribute',
    flags: {},
    args: ['content-type'],
  });
});

test('it parses a pipeline', () => {
  const a = Lang.CmdletCall.tryParse(`Get-Attribute 'content-type'`);

  expect(a).toEqual({
    name: 'Get-Attribute',
    flags: {},
    args: ['content-type'],
  });
});

test('it parses several pipelined cmdlets', () => {
  const a = Lang.Pipeline.tryParse(`Get-Scribble -Name hello | Get-Attribute "content-type"`);

  expect(a).toEqual([
    {
      name: 'Get-Scribble',
      flags: {
        Name: 'hello',
      },
      args: [],
    },
    {
      name: 'Get-Attribute',
      flags: {},
      args: ['content-type'],
    },
  ]);
});
