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
import Version from './version';
import * as pb from '../../../common/api/api_pb';
import loadModule from './module';

/**
 * Mobx model for the scribble.
 */
export default class Scribble {
  /** Scribble ID. */
  readonly scribbleID: ScribbleID;

  /** All the versions keyed by {@link VersionID}. */
  private $versionsByID: Map<VersionID, Version> = new Map();

  /** Scribble title. */
  private $title?: string = undefined;

  /**
   * Creates a new scribble.
   *
   * @param scribbleID Scribble ID, defaults to a new ulid.
   */
  constructor(scribbleID: ScribbleID = ulid()) {
    makeAutoObservable<Scribble, 'toString'>(this, {
      scribbleID: false,
      toString: false as never,
    });
    this.scribbleID = scribbleID;
  }

  /**
   * Builds a scribble from a core scribble.
   *
   * @param coreScribble Source core scribble.
   * @returns New scribble.
   */
  static fromCoreScribble(coreScribble: CoreScribble): Scribble {
    const v = Version.fromCoreScribble(coreScribble);
    const s = new Scribble(coreScribble.id);
    s.$versionsByID.set(v.versionID, v);
    s.$title = coreScribble.title;

    return s;
  }

  /**
   * Builds a scribble from a protobuf message.
   *
   * @param spb Source protobuf message.
   * @returns New scribble.
   */
  static fromProto(spb: pb.Scribble): Scribble {
    const s = new Scribble(spb.getScribbleId());
    s.$title = spb.getTitle() === '' ? undefined : spb.getTitle();
    spb.getVersionList().forEach((vpb) => {
      const v = Version.fromProto(vpb);
      s.$versionsByID.set(v.versionID, v);
    });

    return s;
  }

  get title(): string | undefined {
    return this.$title;
  }

  /**
   * Returns the latest version (by ID).
   * TODO: this is woefully ineffective.
   * TODO: this will fail if the scribble has no versions (and there's no check to enforce that).
   * TODO: this should check for drafts and not return them.
   */
  get latestStableVersion(): Version {
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
    this.$title = otherScribble.$title;
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
    return loadModule(this, {});
  })

  toString(): string {
    let desc = `${this.scribbleID}`;
    if (this.$title) {
      desc += ` "${this.$title}"`;
    }
    return desc;
  }
}
