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

import {
  action, autorun, IReactionDisposer, makeAutoObservable, runInAction, toJS,
} from 'mobx';

import { StorageAPI } from '../client';
import { FetchStatus, isPending } from './fetch_status';
import { CoreScribble } from '../scribble/core_scribble';
import { ScribbleID } from '../scribble/ids';
import Scribble from '../scribble/scribble';
import Version from '../scribble/version';
import sortedScribblesByTag from './tagging';
import { isFailedUpload, isPendingUpload, UploadStatus } from './upload_status';

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

  private $saverDisposer: IReactionDisposer;

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
    this.$saverDisposer = autorun(() => this.saverAction());
  }

  dispose() {
    this.$saverDisposer();
  }

  /**
   * Loads the core scribbles. It's not safe to call this method multiple times.
   *
   * @param coreScribbles The array of the pre-built core scribbles.
   * @internal
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

  /** @internal */
  saverAction() {
    if (isPendingUpload(this.$uploadStatus)) {
      console.log('retrigger saver - waiting');
      return;
    }
    if (isFailedUpload(this.$uploadStatus)) {
      console.log('retrigger saver - waiting for error clear');
      setTimeout(() => runInAction(() => { this.clearUploadError(); }), 5000);
      return;
    }

    const scribblesToUpload = [...this.$scribblesByID.values()].filter((scribble) => scribble.dirty);
    if (scribblesToUpload.length === 0) {
      return;
    }

    this.uploadScribbles(scribblesToUpload);
  }

  /** @internal */
  clearUploadError() {
    if (isFailedUpload(this.$uploadStatus)) {
      this.$uploadStatus = { type: 'idle' };
    }
  }

  get uploadStatus(): UploadStatus {
    return this.$uploadStatus;
  }

  /** @internal */
  async uploadScribbles(scribblesToUpload: Scribble[]): Promise<void> {
    console.log(`will upload ${scribblesToUpload.length} scribbles`);
    this.$uploadStatus = { type: 'pending' };

    const uploadPromises = scribblesToUpload.map((scribble) => {
      const scribblePb = scribble.toProto(true /* dirtyOnly */);
      return this.api.putScribble(scribblePb).then(() => {
        scribble.dirty = false;
      }).catch((e) => {
        throw e;
      });
    });

    try {
      await Promise.all(uploadPromises);
      runInAction(() => { this.$uploadStatus = { type: 'idle' }; });
    } catch (e) {
      runInAction(() => { this.$uploadStatus = { type: 'failed', error: e }; });
    }
    console.log('final upload status', toJS(this.$uploadStatus));
  }

  async fetchScribbleVersion(version: Version) {
    console.log('asked to fetch', version);
    if (version.fetching) {
      return;
    }
    version.fetching = true;
    try {
      const scribble = version.scribble as Scribble;
      const scribblePb = await this.api.getScribble(scribble.scribbleID, [version.versionID]);
      scribble.updateFromProto(scribblePb);
    } catch (e) {
      console.error('failed to fetch the scribble', e);
    }
    version.fetching = false;
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
      const { tags } = latestStableVersion.meta;
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

  /** internal */
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
}

export default ScribblesStore;
