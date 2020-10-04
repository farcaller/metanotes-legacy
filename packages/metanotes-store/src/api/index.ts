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

import { SheetDocument } from '../features/sheets/sheetsSlice';
import { GithubAPI, GithubConfig } from './github';
import { MetanotesServerAPI, MetanotesServerConfig } from './metanotes-server';

export interface BackendAPI {
  getAllSheets(): Promise<SheetDocument[]>;
}

export interface BackendConfig {
  backend: string;
  config: MetanotesServerConfig | GithubConfig;
}

export function createBackend(config: BackendConfig): BackendAPI {
  switch (config.backend) {
    case "github":
      return new GithubAPI(config.config as GithubConfig);
    case "metanotes-server":
      return new MetanotesServerAPI(config.config as MetanotesServerConfig);
    default:
      throw Error(`unknown config backend "${config.backend}"`);
  }
}
