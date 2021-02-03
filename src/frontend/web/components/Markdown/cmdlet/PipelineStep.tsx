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

import React, { ReactElement } from 'react';

import { CmdletCall } from '../../../../filter';
import FinalStep from './FinalStep';
import { Cmdlets } from './cmdlets';


function PipelineStep({ pipeline, input, children, as }: { input?: unknown[]; pipeline: CmdletCall[]; children: ReactElement; as: string; }): JSX.Element {
  const [first, ...rest] = pipeline;
  if (first === undefined) {
    return <FinalStep input={input} as={as}>{children}</FinalStep>;
  }

  const Cmdlet = Cmdlets[first.name];
  if (!Cmdlet) {
    return <>error: no cmdlet {first.name} defined</>;
  }

  return <Cmdlet args={first.args} flags={first.flags} input={input} pipeline={rest} as={as}>{children}</Cmdlet>;
}

export default PipelineStep;
