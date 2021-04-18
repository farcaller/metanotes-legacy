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

import { MetanotesServerAPI, MetanotesServerConfig } from './metanotes-server';
import * as pb from '../../../common/api/api_web_pb/src/common/api/api_pb';

export interface StorageAPI {
  getAllMetadata(): Promise<pb.Scribble[]>;
  getScribble(scribbleID: string, versionIDs: string[]): Promise<pb.Scribble>;
}

export interface APIConfiguration {
  backend: string;
  config: MetanotesServerConfig | unknown;
}

export function createBackend(config: APIConfiguration): StorageAPI {
  switch (config.backend) {
    case 'metanotes-server':
      return new MetanotesServerAPI(config.config as MetanotesServerConfig);
    default:
      throw Error(`unknown config backend "${config.backend}"`);
  }
}
