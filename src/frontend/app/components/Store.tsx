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

import React, { createContext, useContext, useEffect, useState } from 'react';

import { createBackend } from '../../store/client';
import ScribblesStore from '../../store/store';
import coreScribbles from '../../scribbles';

const ScribblesStoreContext = createContext<ScribblesStore>(null as unknown as ScribblesStore);

export function useStore(): ScribblesStore {
  return useContext(ScribblesStoreContext);
}

export function withStore(baseComponent: React.FC<{ store: ScribblesStore }>): React.FC {
  const baseComponentName = baseComponent.displayName || baseComponent.name;

  const WrappedComponent = (props: Record<string, unknown>, ref: unknown) => {
    const store = useStore();
    const newProps = { store, ...props };
    return baseComponent(newProps, ref);
  };
  WrappedComponent.displayName = baseComponentName;

  return WrappedComponent;
}

function Store({ children }: React.PropsWithChildren<Record<string, unknown>>): JSX.Element {
  const [store, setStore] = useState<ScribblesStore>();

  useEffect(() => {
    const backendAddress = process.env.NODE_ENV === 'development'
      ? 'http://localhost:55080' : `${window.location.protocol}//${window.location.host}`;

    const api = createBackend({
      backend: 'metanotes-server',
      config: { hostname: backendAddress },
    });

    const mobxStore = new ScribblesStore(api);
    mobxStore.loadCoreScribbles(coreScribbles);
    setStore(mobxStore);
  }, []);

  useEffect(() => {
    if (store) {
      store.fetchScribbles();
    }
  }, [store]);

  return (
    <ScribblesStoreContext.Provider value={store as ScribblesStore}>
      {store && children}
    </ScribblesStoreContext.Provider>
  );
}

export default Store;
