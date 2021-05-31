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

import { ScribbleID, VersionID } from './ids';
import { Version } from './version';
import * as pb from '../../../common/api/api_web_pb/src/common/api/api_pb';

export interface Scribble {
  /** Scribble ID. */
  readonly scribbleID: ScribbleID;

  /** The title of the last stable version. */
  readonly title: string;

  latestStableVersion: Version | undefined;
  latestVersion: Version;
  allVersions: Version[];
  versionByID(id: VersionID): Version | undefined;

  JSModule<T>(): T;
  createStableVersion(body: string, meta: Map<string, string>): void;
  createDraftVersion(): VersionID;
  removeVersion(versionID: VersionID): void;
  toProto(): pb.Scribble;
}
