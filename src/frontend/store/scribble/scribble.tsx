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

import React from 'react';
import { Text } from 'react-native';
import { action, computed, makeAutoObservable } from 'mobx';
import { ulid } from 'ulid';

import { CoreScribble } from '../interface/core_scribble';
import { ScribbleID, VersionID } from '../interface/ids';
import { ScribblesStore } from '../interface/store';
import Version from './version';
import * as pb from '../../../common/api/api_web_pb/src/common/api/api_pb';
import loadModule from './module';
import { Scribble as ScribbleInterface } from '../interface/scribble';
import { DraftKey } from '../interface/metadata';
import Components from '../../metamarkdown/renderer/components';

/**
 * Mobx model for the scribble.
 */
export default class Scribble implements ScribbleInterface {
  /** Owning scribble store. */
  private readonly store: ScribblesStore;

  /** Scribble ID. */
  readonly scribbleID: ScribbleID;

  /** All the versions keyed by {@link VersionID}. */
  private $versionsByID: Map<VersionID, Version> = new Map();

  private $uploading = false;

  /**
   * Creates a new scribble.
   *
   * @param store Owning store.
   * @param scribbleID Scribble ID, defaults to a new ulid.
   */
  constructor(store: ScribblesStore, scribbleID: ScribbleID = ulid()) {
    makeAutoObservable<Scribble, 'toString'|'store'>(this, {
      scribbleID: false,
      toString: false as never,
      store: false,
      // TODO: why is this needed? seems that it makes the tests happy.
      createStableVersion: action,
      JSModule: computed({ keepAlive: true }),
    });
    this.scribbleID = scribbleID;
    this.store = store;
  }

  /**
   * Builds a scribble from a core scribble.
   *
   * @param store Owning store.
   * @param coreScribble Source core scribble.
   * @returns New scribble.
   */
  static fromCoreScribble(store: ScribblesStore, coreScribble: CoreScribble): Scribble {
    const v = Version.fromCoreScribble(coreScribble);
    const s = new Scribble(store, coreScribble.id);
    s.$versionsByID.set(v.versionID, v);

    return s;
  }

  /**
   * Builds a scribble from a protobuf message.
   *
   * @param store Owning store.
   * @param spb Source protobuf message.
   * @returns New scribble.
   */
  static fromProto(store: ScribblesStore, spb: pb.Scribble): Scribble {
    const s = new Scribble(store, spb.getScribbleId());
    spb.getVersionList().forEach((vpb) => {
      const v = Version.fromProto(vpb);
      s.$versionsByID.set(v.versionID, v);
    });

    return s;
  }

  /**
   * Builds a protobuf message from the scribble.
   *
   * @param dirtyOnly Serializes only the dirty versions if true.
   * @returns Scribble proto.
   */
  toProto(dirtyOnly = false): pb.Scribble {
    const s = new pb.Scribble();
    s.setScribbleId(this.scribbleID);
    const versions = dirtyOnly ? this.dirtyVersions : this.allVersions;
    s.setVersionList(versions.map((v) => v.toProto()));
    return s;
  }

  get title(): string {
    return this.latestStableVersion?.title ?? '';
  }

  get titleForDisplay(): string {
    const version = this.latestVersion;
    return version?.getMeta('display-title') ?? version?.title ?? '';
  }

  get dirty(): boolean {
    return this.dirtyVersions.length > 0;
  }

  set dirty(isDirty: boolean) {
    if (isDirty !== false) {
      throw Error(`cannot mark scribble as dirty`);
    }
    for (const v of this.dirtyVersions) {
      v.dirty = false;
    }
  }

  get uploading(): boolean {
    return this.$uploading;
  }

  set uploading(isUploading: boolean) {
    this.$uploading = isUploading;
  }

  /**
   * Returns the latest non-draft version (by ID).
   * TODO: this is woefully ineffective.
   */
  get latestStableVersion(): Version | undefined {
    const allVersions = Array.from(this.$versionsByID.keys()).sort().reverse();
    for (const versionID of allVersions) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const version = this.$versionsByID.get(versionID)!;
      if (!version.isDraft) {
        return version;
      }
    }
    return undefined;
  }

  /**
   * Returns the latest version (by ID).
   * TODO: this is woefully ineffective.
   */
  get latestVersion(): Version {
    const allVersions = Array.from(this.$versionsByID.keys()).sort();
    const latestVersionID = allVersions[allVersions.length - 1];
    return this.$versionsByID.get(latestVersionID) as Version;
  }

  get allVersions(): Version[] {
    return [...this.$versionsByID.values()];
  }

  get dirtyVersions(): Version[] {
    return [...this.$versionsByID.values()].filter((version) => version.dirty);
  }

  /**
   * Updates the current scribble to match the otherScribble while preserving local versions.
   *
   * @param otherScribble The fetched Scribble.
   */
  updateFrom(otherScribble: Scribble): void {
    otherScribble.$versionsByID.forEach((v, versionID) => {
      if (!this.$versionsByID.has(versionID)) {
        this.$versionsByID.set(versionID, v);
      }
    });
  }

  /**
   * Evaluates and returns the JS module for the scribble.
   *
   * @throws Will throw if failed to load.
   * @returns JS module for the scribble.
   */
  get JSModule(): unknown {
    return loadModule(this, this.store);
  }

  toString(): string {
    let desc = `${this.scribbleID}`;
    if (this.title !== '') {
      desc += ` "${this.title}"`;
    }
    return desc;
  }

  toJSON(): unknown {
    return {
      scribbeID: this.scribbleID,
    };
  }

  toMarkdown(components: Components): JSX.Element {
    return (
      <components.link
        url={`scribbleid://${this.scribbleID}`}
        title={`$${this.scribbleID}`}
      >
        <Text>{this.latestStableVersion?.title ?? `$${this.scribbleID}`}</Text>
      </components.link>
    );
  }

  /**
   * Returns the Version for given ID.
   *
   * @param id Version id.
   *
   * @returns Version.
   */
  versionByID(id: VersionID): Version | undefined {
    return this.$versionsByID.get(id);
  }

  /**
   * Creates a new scribble version with the given body and meta.
   *
   * @param body New version's body.
   * @param meta New version's meta.
   * @throws Will throw if there's a title conflict.
   */
  createStableVersion(body: string, meta: Map<string, string>): void {
    if (meta.get(DraftKey) === 'true') {
      throw Error(`tried to create a stable version for scribble ${this.scribbleID} `
        + `but it has the draft flag in the metadata`);
    }

    const oldTitle = this.title;

    const version = new Version(undefined, meta, body);
    version.dirty = true;
    this.$versionsByID.set(version.versionID, version);

    try {
      this.store.renameScribble(this, oldTitle);
    } catch (e) {
      this.$versionsByID.delete(version.versionID);
      throw e;
    }
  }

  /**
   * Creates a new draft version for scribble using the latest stable version.
   *
   * @throws Will throw if the latest version isn't fetched.
   *
   * @returns Created version ID.
   */
  createDraftVersion(): VersionID {
    const { latestStableVersion } = this;
    if (!latestStableVersion) {
      const newMeta = new Map();
      newMeta.set('mn-draft', 'true');
      newMeta.set('content-type', 'text/markdown');
      const version = new Version(undefined, newMeta, '');
      this.$versionsByID.set(version.versionID, version);

      return version.versionID;
    }

    if (latestStableVersion.body === null) {
      throw Error(`cannot create a draft for scribble ${this.scribbleID} as `
        + `latest stable version ${latestStableVersion.versionID} has no body`);
    }
    const newMeta = latestStableVersion.clonedMetadata;
    newMeta.set('mn-draft', 'true');
    const version = new Version(undefined, newMeta, latestStableVersion.body);
    this.$versionsByID.set(version.versionID, version);

    return version.versionID;
  }

  /**
   * Deletes the version by its id.
   *
   * @param versionID Version ID to remove.
   *
   * @throws Will throw if the scribble doesn't have the specified version.
   */
  removeVersion(versionID: VersionID): void {
    const oldTitle = this.title;
    const version = this.$versionsByID.get(versionID);
    if (!version) {
      throw Error(`cannot remove version ${versionID} from scribble ${this} as there's no such version`);
    }
    this.$versionsByID.delete(versionID);
    if (this.title !== oldTitle) {
      this.store.renameScribble(this, oldTitle);
    }
  }
}
