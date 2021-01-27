// GENERATED CODE -- DO NOT EDIT!

// Original file comments:
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
//
'use strict';
var grpc = require('@grpc/grpc-js');
var api_pb = require('./api_pb.js');
var google_protobuf_empty_pb = require('google-protobuf/google/protobuf/empty_pb.js');

function serialize_google_protobuf_Empty(arg) {
  if (!(arg instanceof google_protobuf_empty_pb.Empty)) {
    throw new Error('Expected argument of type google.protobuf.Empty');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_google_protobuf_Empty(buffer_arg) {
  return google_protobuf_empty_pb.Empty.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_metanotes_api_GetAllMetadataReply(arg) {
  if (!(arg instanceof api_pb.GetAllMetadataReply)) {
    throw new Error('Expected argument of type metanotes.api.GetAllMetadataReply');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_metanotes_api_GetAllMetadataReply(buffer_arg) {
  return api_pb.GetAllMetadataReply.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_metanotes_api_GetScribbleReply(arg) {
  if (!(arg instanceof api_pb.GetScribbleReply)) {
    throw new Error('Expected argument of type metanotes.api.GetScribbleReply');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_metanotes_api_GetScribbleReply(buffer_arg) {
  return api_pb.GetScribbleReply.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_metanotes_api_GetScribbleRequest(arg) {
  if (!(arg instanceof api_pb.GetScribbleRequest)) {
    throw new Error('Expected argument of type metanotes.api.GetScribbleRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_metanotes_api_GetScribbleRequest(buffer_arg) {
  return api_pb.GetScribbleRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_metanotes_api_GetScribblesByTextSearchReply(arg) {
  if (!(arg instanceof api_pb.GetScribblesByTextSearchReply)) {
    throw new Error('Expected argument of type metanotes.api.GetScribblesByTextSearchReply');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_metanotes_api_GetScribblesByTextSearchReply(buffer_arg) {
  return api_pb.GetScribblesByTextSearchReply.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_metanotes_api_GetScribblesByTextSearchRequest(arg) {
  if (!(arg instanceof api_pb.GetScribblesByTextSearchRequest)) {
    throw new Error('Expected argument of type metanotes.api.GetScribblesByTextSearchRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_metanotes_api_GetScribblesByTextSearchRequest(buffer_arg) {
  return api_pb.GetScribblesByTextSearchRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_metanotes_api_RemoveScribbleRequest(arg) {
  if (!(arg instanceof api_pb.RemoveScribbleRequest)) {
    throw new Error('Expected argument of type metanotes.api.RemoveScribbleRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_metanotes_api_RemoveScribbleRequest(buffer_arg) {
  return api_pb.RemoveScribbleRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_metanotes_api_SetScribbleRequest(arg) {
  if (!(arg instanceof api_pb.SetScribbleRequest)) {
    throw new Error('Expected argument of type metanotes.api.SetScribbleRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_metanotes_api_SetScribbleRequest(buffer_arg) {
  return api_pb.SetScribbleRequest.deserializeBinary(new Uint8Array(buffer_arg));
}


var MetanotesService = exports.MetanotesService = {
  getScribble: {
    path: '/metanotes.api.Metanotes/GetScribble',
    requestStream: false,
    responseStream: false,
    requestType: api_pb.GetScribbleRequest,
    responseType: api_pb.GetScribbleReply,
    requestSerialize: serialize_metanotes_api_GetScribbleRequest,
    requestDeserialize: deserialize_metanotes_api_GetScribbleRequest,
    responseSerialize: serialize_metanotes_api_GetScribbleReply,
    responseDeserialize: deserialize_metanotes_api_GetScribbleReply,
  },
  setScribble: {
    path: '/metanotes.api.Metanotes/SetScribble',
    requestStream: false,
    responseStream: false,
    requestType: api_pb.SetScribbleRequest,
    responseType: google_protobuf_empty_pb.Empty,
    requestSerialize: serialize_metanotes_api_SetScribbleRequest,
    requestDeserialize: deserialize_metanotes_api_SetScribbleRequest,
    responseSerialize: serialize_google_protobuf_Empty,
    responseDeserialize: deserialize_google_protobuf_Empty,
  },
  removeScribble: {
    path: '/metanotes.api.Metanotes/RemoveScribble',
    requestStream: false,
    responseStream: false,
    requestType: api_pb.RemoveScribbleRequest,
    responseType: google_protobuf_empty_pb.Empty,
    requestSerialize: serialize_metanotes_api_RemoveScribbleRequest,
    requestDeserialize: deserialize_metanotes_api_RemoveScribbleRequest,
    responseSerialize: serialize_google_protobuf_Empty,
    responseDeserialize: deserialize_google_protobuf_Empty,
  },
  getAllMetadata: {
    path: '/metanotes.api.Metanotes/GetAllMetadata',
    requestStream: false,
    responseStream: false,
    requestType: google_protobuf_empty_pb.Empty,
    responseType: api_pb.GetAllMetadataReply,
    requestSerialize: serialize_google_protobuf_Empty,
    requestDeserialize: deserialize_google_protobuf_Empty,
    responseSerialize: serialize_metanotes_api_GetAllMetadataReply,
    responseDeserialize: deserialize_metanotes_api_GetAllMetadataReply,
  },
  getScribblesByTextSearch: {
    path: '/metanotes.api.Metanotes/GetScribblesByTextSearch',
    requestStream: false,
    responseStream: false,
    requestType: api_pb.GetScribblesByTextSearchRequest,
    responseType: api_pb.GetScribblesByTextSearchReply,
    requestSerialize: serialize_metanotes_api_GetScribblesByTextSearchRequest,
    requestDeserialize: deserialize_metanotes_api_GetScribblesByTextSearchRequest,
    responseSerialize: serialize_metanotes_api_GetScribblesByTextSearchReply,
    responseDeserialize: deserialize_metanotes_api_GetScribblesByTextSearchReply,
  },
};

exports.MetanotesClient = grpc.makeGenericClientConstructor(MetanotesService);
