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

import React, { createContext, useContext } from 'react';
import { makeAutoObservable } from 'mobx';

import { Scribble } from '../../store/interface/scribble';
import { ScribblesStore } from '../../store/interface/store';
import { useStore } from './Store';

export class SpreadStore {
  scribbles: Scribble[] = [];

  private scribblesStore: ScribblesStore;

  /**
   * Creates a new store.
   */
  constructor(scribblesStore: ScribblesStore) {
    makeAutoObservable<SpreadStore, 'scribblesStore'>(this, {
      scribblesStore: false,
    });
    this.scribblesStore = scribblesStore;
  }

  /**
   * Creates a new scribble and adds it to the spread.
   */
  createScribble() {
    const scribble = this.scribblesStore.createScribble();
    this.scribbles.push(scribble);
  }

  /**
   * Removes the scribble from the spread.
   *
   * @param scribble The scribble to remove.
   */
  removeScribble(scribble: Scribble) {
    const idx = this.scribbles.indexOf(scribble);
    if (idx === -1) {
      console.error(`the scribble isn't in the spread:`, scribble);
      return;
    }
    this.scribbles.splice(idx, 1);
  }
}

const SpreadStoreContext = createContext<SpreadStore>(undefined as unknown as SpreadStore);

export function useSpreadStore(): SpreadStore {
  return useContext(SpreadStoreContext);
}

function SpreadStoreProvider({ children }: React.PropsWithChildren<unknown>) {
  const store = useStore();

  return (
    <>
      <SpreadStoreContext.Provider value={new SpreadStore(store)}>
        {children}
      </SpreadStoreContext.Provider>
    </>
  );
}

export default React.memo(SpreadStoreProvider);
