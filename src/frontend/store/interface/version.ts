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

import { ComputedMetadata } from './computed_metadata';
import { VersionID } from './ids';
import * as pb from '../../../common/api/api_web_pb/src/common/api/api_pb';

export interface Version {
  /** Version ID. */
  readonly versionID: VersionID;

  /** Version body if fetched, null otherwise. New versions are created with body set to an empty string. */
  readonly body: string | null;

  getMeta(key: string): string | undefined;
  readonly isDraft: boolean;

  readonly creationDate: Date;

  computedMeta: ComputedMetadata;
  clonedMetadata: Map<string, string>;
  toProto(): pb.Version;
  readonly isCore: boolean;
}
