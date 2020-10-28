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

import util from 'util';
import * as grpc from '@grpc/grpc-js';
import * as google_protobuf_empty_pb from 'google-protobuf/google/protobuf/empty_pb';

import pb from '@metanotes/server-api/lib/api_pb';
import grpc_pb from '@metanotes/server-api/lib/api_grpc_pb';
import { Store } from './store';
import { exit } from 'process';


function getScribble(store: Store): grpc.handleUnaryCall<pb.GetScribbleRequest, pb.GetScribbleReply> {
  return async function(call, callback) {
    try {
      const s = await store.getScribble(call.request.getId());
      const sc = new pb.Scribble();
      sc.setBody(s.body);
      sc.setId(s.id);
      sc.setContentType(s.contentType);
      const amap = sc.getAttributesMap();
      s.attributes.forEach((v, k) => {
        amap.set(k, v);
      });

      const rep = new pb.GetScribbleReply();
      rep.setScribble(sc);
      callback(null, rep);
    } catch (e) {
      callback(e, null);
    }
  };
}

function getAllMetadata(store: Store): grpc.handleUnaryCall<google_protobuf_empty_pb.Empty, pb.GetAllMetadataReply> {
  return async function (_, callback) {
    try {
      const mds = await store.getAllMetadata();

      const scribs = mds.map(s => {
        const sc = new pb.Scribble();
        sc.setId(s.id);
        sc.setContentType(s.contentType);
        const amap = sc.getAttributesMap();
        s.attributes.forEach((v, k) => {
          amap.set(k, v);
        });
        return sc;
      });

      const rep = new pb.GetAllMetadataReply();
      rep.setScribbleList(scribs);
      callback(null, rep);
    } catch (e) {
      callback(e, null);
    }
  };
}

function setScribble(store: Store): grpc.handleUnaryCall<pb.SetScribbleRequest, google_protobuf_empty_pb.Empty> {
  return async function (call, callback) {
    try {
      const sc = call.request.getScribble();
      const amap = new Map<string, string>();
      sc.getAttributesMap().forEach((v, k) => amap.set(k, v));
      await store.setScribble({
        id: sc.getId(),
        contentType: sc.getContentType(),
        body: sc.getBody(),
        attributes: amap,
      });
      callback(null, new google_protobuf_empty_pb.Empty());
    } catch (e) {
      callback(e, null);
    }
  };
}

function removeScribble(store: Store): grpc.handleUnaryCall<pb.RemoveScribbleRequest, google_protobuf_empty_pb.Empty> {
  return async function (call, callback) {
    try {
      await store.removeScribble(call.request.getId());
      callback(null, new google_protobuf_empty_pb.Empty());
    } catch (e) {
      callback(e, null);
    }
  };
}

export function runServer(bind: string, store: Store): void {
  const server = new grpc.Server({
    'grpc.max_send_message_length': -1,
    'grpc.max_receive_message_length': -1,
    'grpc.initial_reconnect_backoff_ms': 5000,
  });
  server.addService(grpc_pb.MetanotesService as never, {
    getScribble: getScribble(store),
    getAllMetadata: getAllMetadata(store),
    setScribble: setScribble(store),
    removeScribble: removeScribble(store),
  });
  server.bindAsync(bind, grpc.ServerCredentials.createInsecure(), (e, _) => {
    if (e) {
      console.log('failed to bind:', e);
      exit(1);
    }
    server.start();
  });
}
