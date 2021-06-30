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

import React, { useEffect, useState } from 'react';

import { StorageAPI } from './client';
import ScribblesStore from './store';
import coreScribbles from '../scribbles';
import ScribblesStoreContext from './context';

function StoreProvider({ api, children }: React.PropsWithChildren<{ api?: StorageAPI }>): JSX.Element {
  const [store, setStore] = useState<ScribblesStore>();

  useEffect(() => {
    if (api === undefined) {
      return;
    }

    const mobxStore = new ScribblesStore(api);
    mobxStore.loadCoreScribbles(coreScribbles);
    setStore(mobxStore);

    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-underscore-dangle,@typescript-eslint/no-explicit-any
      (window as any).__ScribblesStore = mobxStore;
    }
  }, [api]);

  useEffect(() => {
    if (store && api) {
      store.fetchScribbles();
    }
  }, [store, api]);

  return (
    <ScribblesStoreContext.Provider value={store as ScribblesStore}>
      {store && children}
    </ScribblesStoreContext.Provider>
  );
}

export default React.memo(StoreProvider);

/**
 * A testing store context.
 */
function ExternalStoreImpl({ store, children }: React.PropsWithChildren<{ store: ScribblesStore }>): JSX.Element {
  return (
    <ScribblesStoreContext.Provider value={store}>
      {store && children}
    </ScribblesStoreContext.Provider>
  );
}

export const ExternalStore = React.memo(ExternalStoreImpl);
