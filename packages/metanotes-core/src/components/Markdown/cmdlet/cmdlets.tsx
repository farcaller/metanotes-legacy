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

import { CmdletCall } from '@metanotes/filter';
import { FunctionComponent } from 'react';

import GetAttribute from './cmdlets/GetAttribute';
import GetScribbles from './cmdlets/GetScribble';


// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface CmdletProps<P=any> {
  args: (string|number)[];
  flags: { [key: string]: string };

  pipeline: CmdletCall[];
  as: string;

  input: P;
};

export const Cmdlets: { [key: string]: FunctionComponent<CmdletProps> } = {
  'Get-Scribbles': GetScribbles,
  'Get-Attribute': GetAttribute,
};
