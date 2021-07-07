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
import { ulid, decodeTime } from 'ulid';
import { computedFn } from 'mobx-utils';
import * as wpb from 'google-protobuf/google/protobuf/wrappers_pb';

import { CoreScribble } from './core_scribble';
import { ScribbleID, VersionID } from './ids';
import * as pb from '../../../common/api/api_web_pb/src/common/api/api_pb';
import ComputedMetadata from './computed_metadata';
import Scribble from './scribble_interface';

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
  /** Owning scribble. */
  readonly scribble: Scribble;

  /** Version ID. */
  readonly versionID: VersionID;

  /** Version body if fetched, null otherwise. New versions are created with body set to an empty string. */
  private $body: string | null;

  /** Version metadata. */
  private readonly $meta: Map<string, string>;

  /** Computed metadata. */
  private $computedMeta: ComputedMetadata;

  /** True when the version needs to be uploaded. */
  private $dirty = false;

  /** True if the store is currently fetching this version. */
  fetching = false;

  /**
   * Creates a new scribble version.
   *
   * @param scribble Owning scribble.
   * @param versionID Version ID, defaults to a new ulid.
   * @param meta Version metadata.
   * @param body Optional version body. If there's no body the version isn't fully fetched.
   */
  constructor(
    scribble: Scribble,
    versionID: VersionID = ulid(),
    meta: Map<string, string>,
    body?: string,
  ) {
    makeAutoObservable<Version, 'toString'|'scribble'>(this, {
      versionID: false,
      toString: false as never,
      scribble: false,
    });
    this.versionID = versionID;
    this.$computedMeta = new ComputedMetadata(this);
    this.$meta = meta;
    this.$body = body ?? null;
    this.scribble = scribble;
  }

  get creationDate(): Date {
    return new Date(decodeTime(this.versionID));
  }

  /** @internal */
  toString(): string {
    let desc = `${this.versionID}`;
    if (this.meta.title !== '') {
      desc += ` "${this.meta.title}"`;
    }
    return desc;
  }

  /**
   * Builds a version from a core scribble.
   *
   * @param scribble Owning scribble.
   * @param coreScribble Source core scribble.
   * @returns New version.
   * @internal
   */
  static fromCoreScribble(scribble: Scribble, coreScribble: CoreScribble): Version {
    const m = new Map();
    for (const k of Object.keys(coreScribble.meta)) {
      m.set(k, coreScribble.meta[k]);
    }
    const v = new Version(scribble, coreVersionForScribbleID(coreScribble.id), m, coreScribble.body);

    return v;
  }

  /**
   * Builds a version from a protobuf message.
   *
   * @param scribble Owning scribble.
   * @param vpb Source protobuf message.
   * @returns New version.
   * @internal
   */
  static fromProto(scribble: Scribble, vpb: pb.Version): Version {
    const m = new Map();
    vpb.getMetaMap().forEach((val: string, key: string) => { m.set(key, val); });
    const v = new Version(scribble, vpb.getVersionId(), m, vpb.getTextBody()?.getValue());
    return v;
  }

  /**
   * Builds a protobuf message from the version.
   *
   * @returns Version proto.
   * @internal
   */
  toProto(): pb.Version {
    const v = new pb.Version();
    v.setVersionId(this.versionID);
    v.setTextBody(new wpb.StringValue().setValue(this.body!)); // TODO: fail if null
    const m = v.getMetaMap();
    this.$meta.forEach((vv, k) => m.set(k, vv));
    return v;
  }

  /** @internal */
  toJSON(): unknown {
    return {
      versionID: this.versionID,
    };
  }

  get body(): string | null {
    if (this.$body === null) {
      this.scribble.fetchVersion(this);
    }
    return this.$body;
  }

  /**
   * Returns the value for given metadata key.
   *
   * @param key Metadata key.
   * @returns Metadata value or `undefined` if value isn't defined.
   * @internal
   */
  readonly getMeta = computedFn(function getMeta(this: Version, key: string): string | undefined {
    return this.$meta.get(key);
  })

  get meta(): ComputedMetadata {
    return this.$computedMeta;
  }

  get clonedMetadata(): Map<string, string> {
    return new Map(this.$meta);
  }

  get dirty(): boolean {
    return this.$dirty;
  }

  set dirty(isDirty: boolean) {
    this.$dirty = isDirty;
  }

  get isCore(): boolean {
    return this.versionID.endsWith('CORE');
  }
}
