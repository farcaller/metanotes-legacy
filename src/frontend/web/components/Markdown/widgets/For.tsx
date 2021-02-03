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

/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import React, { ReactElement, useMemo } from 'react';
// import { Pipeline } from '../../../../filter';
import { Pipeline } from '../../../../filter';
import PipelineStep from '../cmdlet/PipelineStep';


function For({ filter, as, children }: { filter: string, as: string, children: ReactElement }): JSX.Element {
  const pipeline = useMemo(() => Pipeline.tryParse(filter), [filter]);

  return <PipelineStep pipeline={pipeline} as={as}>{children}</PipelineStep>;
};

export default React.memo(For);
