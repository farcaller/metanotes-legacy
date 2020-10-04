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

import fetch from 'cross-fetch';

import { SheetDocument } from '../features/sheets/sheetsSlice';


export interface MetanotesServerConfig {
  baseURL: string;
}

export class MetanotesServerAPI {
  private readonly baseURL: string;

  constructor(config: MetanotesServerConfig) {
    this.baseURL = config.baseURL;
  }

  async getAllSheets(): Promise<SheetDocument[]> {
    const resp = await fetch(`${this.baseURL}/all`, { method: 'post' });
    // TODO: strict api schema
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const json = (await resp.json()) as SheetDocument[];
    return json;
  }
}
