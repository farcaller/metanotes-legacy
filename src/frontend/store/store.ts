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

import { makeAutoObservable, runInAction } from 'mobx';

import { StorageAPI } from './client';
import { FetchStatus, isPending } from './fetch_status';
import { CoreScribble } from './interface/core_scribble';
import { ScribbleID } from './interface/ids';
import Scribble from './scribble/scribble';

/**
 * The mobx store for scribbles, both core and remote.
 */
class ScribblesStore {
  /** Backend API interface. */
  private api: StorageAPI;

  /** All the scribbles keyed by {@link ScribbleID}. */
  private $scribblesByID: Map<ScribbleID, Scribble> = new Map();

  /** All the scribbles keyed by title. */
  private $scribblesByTitle: Map<string, Scribble> = new Map();

  /** Remote pull status. */
  private $fetchStatus: FetchStatus = { type: 'idle' };

  /**
   * Creates a new store.
   *
   * @param api Backend API.
   */
  constructor(api: StorageAPI) {
    makeAutoObservable<ScribblesStore, 'api'>(this, {
      api: false,
    });
    this.api = api;
  }

  /**
   * Loads the core scribbles. It's not safe to call this method multiple times.
   *
   * @param coreScribbles The array of the pre-built core scribbles.
   */
  loadCoreScribbles(coreScribbles: CoreScribble[]): void {
    for (const coreScribble of coreScribbles) {
      this.addScribble(Scribble.fromCoreScribble(coreScribble));
    }
  }

  /**
   * Fetches the scribbles from the remote and updates the local versions.
   *
   * @returns Nothing.
   */
  async fetchScribbles(): Promise<void> {
    if (isPending(this.$fetchStatus)) {
      return Promise.reject(Error('requested fetchScribbles while already fetching'));
    }
    this.$fetchStatus = { type: 'pending' };
    try {
      const scribblePbs = await this.api.getAllMetadata();
      runInAction(() => {
        scribblePbs.forEach((spb) => {
          const s = Scribble.fromProto(spb);
          if (this.$scribblesByID.has(s.scribbleID)) {
            this.$scribblesByID.get(s.scribbleID)?.updateFrom(s);
          } else {
            this.addScribble(s);
          }
        });

        this.$fetchStatus = { type: 'idle' };
      });
    } catch (e) {
      runInAction(() => {
        this.$fetchStatus = { type: 'failed', error: e };
      });
    }
    return Promise.resolve(); // TODO: why isn't linter happy without this?
  }

  /**
   * Returns the scribble by its ID.
   *
   * @param scribbleID The scribble ID.
   * @returns Scribble or undefined if no scribble found.
   */
  scribbleByID(scribbleID: ScribbleID): Scribble | undefined {
    return this.$scribblesByID.get(scribbleID);
  }

  /**
   * Returns the scribble by its title.
   *
   * @param title The title.
   * @returns Scribble or undefined if no scribble found.
   */
  scribbleByTitle(title: string): Scribble | undefined {
    return this.$scribblesByTitle.get(title);
  }

  /**
   * Returns all scribbles.
   * TODO: this is supposedly quite ineffective.
   */
  get scribbles(): Scribble[] {
    return Array.from(this.$scribblesByID.values());
  }

  get fetchStatus(): FetchStatus {
    return this.$fetchStatus;
  }

  /**
   * Adds the scribble to the store.
   *
   * @throws Will throw if the scribble already exists in either ID or title indices.
   * @param scribble New scribble.
   */
  private addScribble(scribble: Scribble) {
    const { title } = scribble;

    if (this.$scribblesByID.has(scribble.scribbleID)) {
      throw Error(`attempted to insert scribble ${scribble.scribbleID} when such id already exists`);
    }
    if (title !== undefined && this.$scribblesByTitle.has(title)) {
      throw Error(`attempted to insert scribble ${scribble.scribbleID} with title '${title}' `
                   + `when such title already exists`);
    }
    this.$scribblesByID.set(scribble.scribbleID, scribble);
    if (title !== undefined) {
      this.$scribblesByTitle.set(title, scribble);
    }
  }
}

export default ScribblesStore;
