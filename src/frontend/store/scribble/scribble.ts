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
import { ulid } from 'ulid';
import { computedFn } from 'mobx-utils';

import { CoreScribble } from '../interface/core_scribble';
import { ScribbleID, VersionID } from '../interface/ids';
import { ScribblesStore } from '../interface/store';
import Version from './version';
import * as pb from '../../../common/api/api_web_pb/src/common/api/api_pb';
import loadModule from './module';
import localsForScribble from './module/locals';
import { Scribble as ScribbleInterface } from '../interface/scribble';

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

  get title(): string {
    return this.latestStableVersion?.title ?? '';
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
  JSModule = computedFn(function JSModule<T>(this: Scribble): T {
    return loadModule(this, {
      ...localsForScribble(this),
      requireScribble: this.store.requireScribble.bind(this.store),
    });
  })

  toString(): string {
    let desc = `${this.scribbleID}`;
    if (this.title !== '') {
      desc += ` "${this.title}"`;
    }
    return desc;
  }

  /**
   * Creates a new scribble version with the given body and meta.
   *
   * @param body New version's body.
   * @param meta New version's meta.
   */
  createVersion(body: string, meta: Map<string, string>): void {
    const version = new Version(undefined, meta, body);
    this.$versionsByID.set(version.versionID, version);
  }
}
