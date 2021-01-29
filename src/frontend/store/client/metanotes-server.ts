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
import * as grpc_web_pb from '../../../common/api/api_grpc_web_pb';
import { Scribble, fromProto, toProto } from '../features/scribbles/scribble';

export interface MetanotesServerConfig {
  hostname: string;
}

export class MetanotesServerAPI {
  private readonly client: grpc_web_pb.MetanotesPromiseClient;

  constructor(config: MetanotesServerConfig) {
    this.client = new grpc_web_pb.MetanotesPromiseClient(config.hostname);
  }

  async getAllMetadata(): Promise<Scribble[]> {
    const rep = await this.client.getAllMetadata(new emptyPb.Empty());
    return rep.getScribbleList().map(spb => {
      const s = fromProto(spb, true);
      s.status = 'syncedMetadataOnly';
      return s;
    });
  }

  async getScribble(id: string): Promise<Scribble> {
    const req = new pb.GetScribbleRequest();
    req.setId(id);

    const rep = await this.client.getScribble(req);
    const spb = rep.getScribble();
    if (spb !== undefined) {
      const s = fromProto(spb, false);
      return s;
    }
    throw Error('scribble not found');
  }

  async setScribble(scribble: Scribble): Promise<void> {
    const req = new pb.SetScribbleRequest();
    const spb = await toProto(scribble);
    req.setScribble(spb);

    await this.client.setScribble(req);
  }

  removeScribble(id: string): Promise<void> {
    throw Error('unimplemented');
  }
}
