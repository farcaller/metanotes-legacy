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

import { useContext } from 'react';
import { action, makeAutoObservable, runInAction } from 'mobx';

import { StorageAPI } from './client';
import { FetchStatus, isPending } from './fetch_status';
import { CoreScribble } from './scribble/core_scribble';
import { ScribbleID } from './scribble/ids';
import Scribble from './scribble/scribble';
import sortedScribblesByTag from './tagging';
import { isPendingQueuedUpload, isPendingUpload, UploadStatus } from './upload_status';
import ScribblesStoreContext from './context';

export function useStore(): ScribblesStore {
  return useContext(ScribblesStoreContext);
}

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

  /** Remote push status. */
  private $uploadStatus: UploadStatus = { type: 'idle' };

  /**
   * Creates a new store.
   *
   * @param api Backend API.
   */
  constructor(api: StorageAPI) {
    makeAutoObservable<ScribblesStore, 'api' | 'useStore'>(this, {
      api: false,
      useStore: false,
      // TODO: why is this needed? seems that it makes the tests happy.
      createDraftScribble: action,
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
      this.addScribble(Scribble.fromCoreScribble(this, coreScribble));
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
          const s = Scribble.fromProto(this, spb);
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
    return Promise.resolve();
  }

  async uploadScribbles(): Promise<void> {
    if (isPendingUpload(this.$uploadStatus)) {
      this.$uploadStatus = { type: 'pending-queued' };
      return;
    }
    if (isPendingQueuedUpload(this.$uploadStatus)) {
      return;
    }

    this.$uploadStatus = { type: 'pending' };
    const scribblesToUpload = [...this.$scribblesByID.values()].filter((scribble) => scribble.dirty);

    const uploadPromises = scribblesToUpload.map((scribble) => {
      const scribblePb = scribble.toProto(true /* dirtyOnly */);
      scribble.uploading = true;
      return this.api.putScribble(scribblePb).then(() => {
        scribble.uploading = false;
        scribble.dirty = false;
      }).catch((e) => {
        scribble.uploading = false;
        throw e;
      });
    });

    try {
      await Promise.all(uploadPromises);

      if (isPendingQueuedUpload(this.$uploadStatus)) {
        // TODO: is this dangerously stacked?
        await this.uploadScribbles();
      } else {
        this.$uploadStatus = { type: 'idle' };
      }
    } catch (e) {
      this.$uploadStatus = { type: 'failed', error: e };
    }
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
   * Returns the scribbles matching the given tag using the tiddlywiki sort algorithm.
   *
   * @param tag The tag.
   * @returns Sorted array of matched scribbles.
   */
  scribblesByTag(tag: string): Scribble[] {
    // TODO: this isn't computed anymore. Make it like `store.tag('tag').scribbles`?
    const matchingScribbles = this.scribbles.filter((scribble) => {
      const { latestStableVersion } = scribble;
      if (!latestStableVersion) { return false; }
      const { tags } = latestStableVersion.computedMeta;
      if (!tags) { return false; }
      if (tags.indexOf(tag) === -1) { return false; }
      return true;
    });
    const tagScribble = this.scribbleByTitle(tag);
    return sortedScribblesByTag(matchingScribbles, tagScribble);
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
    if (title !== '' && this.$scribblesByTitle.has(title)) {
      throw Error(`attempted to insert scribble ${scribble.scribbleID} with title '${title}' `
                   + `when such title already exists`);
    }
    this.$scribblesByID.set(scribble.scribbleID, scribble);
    if (title !== '') {
      this.$scribblesByTitle.set(title, scribble);
    }
  }

  /**
   * Returns the JSModule for a scribble by title.
   *
   * This API is re-exported into the scribbles as `requireScribble`.
   *
   * @param title Scribble title.
   * @returns JSModule of the scribble.
   * @throws All the JSModule exceptions.
   */
  requireScribble<T>(title: string): T {
    const scribble = this.scribbleByTitle(title);
    if (!scribble) {
      // TODO: catch it?
      throw Error(`failed to require scribble: '${title}': does not exist`);
    }
    return scribble.JSModule as T;
  }

  /**
   * Creates a new scribble with an empty version.
   *
   * @returns New scribble.
   */
  createDraftScribble(): Scribble {
    const scribble = new Scribble(this);
    scribble.createDraftVersion();

    this.addScribble(scribble);
    return scribble;
  }

  /**
   * Renames the scribble. This is @private api.
   *
   * @param scribble The scribble to rename.
   * @param oldTitle The scribble's old title.
   * @throws Will throw if the new title exists.
   */
  renameScribble(scribble: Scribble, oldTitle: string): void {
    if (oldTitle !== '') {
      this.$scribblesByTitle.delete(oldTitle);
    }
    const { title } = scribble;
    if (title !== '') {
      if (this.$scribblesByTitle.has(title)) {
        throw Error(`tried to rename scribble ${scribble} from ${oldTitle} but title ${title} already exists`);
      }
      this.$scribblesByTitle.set(title, scribble);
    }
  }

  /**
   * Silently removes the scribble without recording it for sync.
   *
   * @param scribble The scribble to remove.
   */
  removeScribble(scribble: Scribble): void {
    this.$scribblesByID.delete(scribble.scribbleID);
    if (scribble.title !== '') {
      this.$scribblesByTitle.delete(scribble.title);
    }
  }

  useStore = useStore;
}

export default ScribblesStore;
