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

import { makeAutoObservable } from 'mobx';

import Scribble from '../scribble/scribble';
import ScribblesStore from '../scribbles_store/store';

class SpreadStore {
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
  createScribble(): void {
    const scribble = this.scribblesStore.createDraftScribble();
    this.scribbles.push(scribble);
  }

  openScribble(title: string): void {
    const scribble = this.scribblesStore.scribbleByTitle(title);
    if (!scribble) {
      return;
    }
    if (this.scribbles.find((s) => s.scribbleID === scribble.scribbleID) !== undefined) {
      return;
    }
    this.scribbles.push(scribble);
  }

  /**
   * Removes the scribble from the spread.
   *
   * @param scribble The scribble to remove.
   */
  removeScribble(scribble: Scribble): void {
    const idx = this.scribbles.indexOf(scribble);
    if (idx === -1) {
      console.error(`the scribble isn't in the spread:`, scribble);
      return;
    }

    // clean up the scribble if we're closing it
    if (scribble.latestVersion.isDraft) {
      if (scribble.allVersions.length === 1) {
        this.scribblesStore.removeScribble(scribble);
      } else {
        scribble.removeVersion(scribble.latestVersion.versionID);
      }
    }
    this.scribbles.splice(idx, 1);
  }
}

export default SpreadStore;
