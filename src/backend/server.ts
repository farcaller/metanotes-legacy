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

import { exit } from 'process';

import * as grpc from '@grpc/grpc-js';
import * as google_protobuf_empty_pb from 'google-protobuf/google/protobuf/empty_pb';

import * as pb from '@metanotes/api/api_pb';
import * as grpc_pb from '@metanotes/api/api_grpc_pb';
import { Store } from './store';


function getScribble(store: Store): grpc.handleUnaryCall<pb.GetScribbleRequest, pb.GetScribbleReply> {
  return async function(call, callback) {
    try {
      const s = await store.getScribble(call.request.getId());
      const rep = new pb.GetScribbleReply();
      rep.setScribble(s);
      callback(null, rep);
    } catch (e) {
      callback(e, null);
    }
  };
}

function getAllMetadata(store: Store): grpc.handleUnaryCall<google_protobuf_empty_pb.Empty, pb.GetAllMetadataReply> {
  return async function (_, callback) {
    try {
      const scribbles = await store.getAllMetadata();
      const rep = new pb.GetAllMetadataReply();
      rep.setScribbleList(scribbles);
      callback(null, rep);
    } catch (e) {
      callback(e, null);
    }
  };
}

function setScribble(store: Store): grpc.handleUnaryCall<pb.SetScribbleRequest, google_protobuf_empty_pb.Empty> {
  return async function (call, callback) {
    try {
      // TODO: ts(2345)
      await store.setScribble(call.request.getScribble()!);
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

function getScribblesByTextSearch(store: Store): grpc.handleUnaryCall<pb.GetScribblesByTextSearchRequest, pb.GetScribblesByTextSearchReply> {
  return async function (call, callback) {
    try {
      const result = await store.getScribblesByTextSearch(call.request.getQuery());
      const rep = new pb.GetScribblesByTextSearchReply();
      rep.setResultList(result);
      callback(null, rep);
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
    getScribblesByTextSearch: getScribblesByTextSearch(store),
  });
  try {
    server.bindAsync(bind, grpc.ServerCredentials.createInsecure(), (e, _) => {
      if (e) {
        console.log('failed to bind:', e);
        exit(1);
      }
      server.start();
    });
  } catch (e) {
    console.log('failed to bind:', e);
    exit(1);
  }
}
