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

import * as emptyPb from 'google-protobuf/google/protobuf/empty_pb';

import * as pb from '../../../common/api/api_pb';
import * as grpcWebPb from '../../../common/api/api_grpc_web_pb';

export interface MetanotesServerConfig {
  hostname: string;
}

export class MetanotesServerAPI {
  private readonly client: grpcWebPb.MetanotesPromiseClient;

  constructor(config: MetanotesServerConfig) {
    this.client = new grpcWebPb.MetanotesPromiseClient(config.hostname);
    // eslint-disable-next-line no-underscore-dangle,@typescript-eslint/no-empty-function,@typescript-eslint/no-explicit-any
    const enableDevTools = (window as any).__GRPCWEB_DEVTOOLS__ || (() => {});
    enableDevTools([
      this.client,
    ]);
  }

  async getAllMetadata(): Promise<pb.Scribble[]> {
    const rep = await this.client.getAllMetadata(new emptyPb.Empty());
    return rep.getScribbleList();
  }

  async getScribble(scribbleID: string, versionIDs: string[]): Promise<pb.Scribble> {
    const req = new pb.GetScribbleRequest();
    req.setScribbleId(scribbleID);
    req.setVersionIdList(versionIDs);

    const rep = await this.client.getScribble(req);
    const spb = rep.getScribble();
    if (spb !== undefined) {
      return spb;
    }
    throw Error('scribble not found');
  }
}
