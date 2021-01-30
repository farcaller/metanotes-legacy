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

import React, { cloneElement, PropsWithChildren, ReactElement, useMemo } from 'react';

import { SetVar } from '../widgets/variables';


type FinalStepProps = {
  input?: unknown[];
  as: string;
};

function FinalStep({ input, as, children }: PropsWithChildren<FinalStepProps>): JSX.Element {
  if (input === undefined) {
    input = [];
  }

  // TODO: I spent some non-trivial type to propery guess the type and I failed.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const unrolledChildren: any = useMemo(() => {
    // validated above
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return input!.map((i, idx) => {
      const vars = { [as]: i };
      
      return <SetVar key={idx} vars={vars}>
        {cloneElement(children as ReactElement)}
      </SetVar>;
    });
  }, [input]);


  return <>{unrolledChildren}</>;
}

export default FinalStep;