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
import * as pb from '../../../common/api/api_pb';
import ComputedMetadata from './computed_metadata';

/**
 * Generates a costant VersionID for the given ScribbleID.
 * The resulting version has its timestamp set to 0 and the last 4 bytes spelling 'CORE'.
 *
 * @param scribbleID Source ScribbleID.
 * @returns Resulting VersionID.
 */
function coreVersionForScribbleID(scribbleID: ScribbleID): VersionID {
  return `0000000000${scribbleID.substr(10, 26 - 10 - 4)}CORE`;
}

/**
 * Mobx model for the scribble version.
 */
export default class Version {
  /** Version ID. */
  readonly versionID: VersionID;

  /** Version body if fetched, null otherwise. New versions are created with body set to an empty string. */
  private $body: string | null = null;

  /** Version metadata. */
  private $meta: Map<string, string> = new Map();

  /** Computed metadata. */
  private $computedMeta: ComputedMetadata;

  /**
   * Creates a new scribble version.
   *
   * @param versionID Version ID, defaults to a new ulid.
   */
  constructor(versionID: VersionID = ulid()) {
    makeAutoObservable(this, {
      versionID: false,
    });
    this.versionID = versionID;
    this.$computedMeta = new ComputedMetadata(this);
  }

  /**
   * Builds a version from a core scribble.
   *
   * @param coreScribble Source core scribble.
   * @returns New version.
   */
  static fromCoreScribble(coreScribble: CoreScribble): Version {
    const v = new Version(coreVersionForScribbleID(coreScribble.id));
    v.$body = coreScribble.body;
    const m = new Map();
    for (const k of Object.keys(coreScribble.meta)) {
      m.set(k, coreScribble.meta[k]);
    }
    v.$meta = m;

    return v;
  }

  /**
   * Builds a version from a protobuf message.
   *
   * @param vpb Source protobuf message.
   * @returns New version.
   */
  static fromProto(vpb: pb.Version): Version {
    const v = new Version(vpb.getVersionId());
    const m = new Map();
    vpb.getMetaMap().forEach((val: string, key: string) => { m.set(key, val); });
    v.$body = vpb.getTextBody();
    v.$meta = m;
    return v;
  }

  get body(): string | null {
    return this.$body;
  }

  /**
   * Returns the value for given metadata key.
   *
   * @param key Metadata key.
   * @returns Metadata value or `undefined` if value isn't defined.
   */
  getMeta = computedFn(function getMeta(this: Version, key: string): string | undefined {
    return this.$meta.get(key);
  })

  get computedMeta(): ComputedMetadata {
    return this.$computedMeta;
  }
}
