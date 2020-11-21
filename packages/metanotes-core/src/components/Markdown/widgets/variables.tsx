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

import React, { PropsWithChildren, useCallback, useContext } from 'react';


type VariablesContextType = (key: string) => unknown;
export const VariablesContext = React.createContext(null as unknown as VariablesContextType);

type SetVarProps = {
  vars: { [key: string]: unknown };
};

export function SetVar({ vars, children }: PropsWithChildren<SetVarProps>): JSX.Element {
  const prevVarGetter = useContext(VariablesContext);

  const varContext = useCallback((key: string) => {
    const v = vars[key];
    if (v) { return v; }
    return prevVarGetter(key);
  }, [vars, prevVarGetter]);

  return <VariablesContext.Provider value={varContext}>
    {children}
  </VariablesContext.Provider>;
}

type EchoProps = {
  name: string;
};

export function Echo({ name }: EchoProps): JSX.Element {
  const getter = useContext(VariablesContext);

  return <>{getter(name)}</>;
}
