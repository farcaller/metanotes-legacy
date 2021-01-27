// package: metanotes.api
// file: api.proto

/* tslint:disable */
/* eslint-disable */

import * as grpc from "@grpc/grpc-js";
import {handleClientStreamingCall} from "@grpc/grpc-js/build/src/server-call";
import * as api_pb from "./api_pb";
import * as google_protobuf_empty_pb from "google-protobuf/google/protobuf/empty_pb";

interface IMetanotesService extends grpc.ServiceDefinition<grpc.UntypedServiceImplementation> {
    getScribble: IMetanotesService_IGetScribble;
    setScribble: IMetanotesService_ISetScribble;
    removeScribble: IMetanotesService_IRemoveScribble;
    getAllMetadata: IMetanotesService_IGetAllMetadata;
    getScribblesByTextSearch: IMetanotesService_IGetScribblesByTextSearch;
}

interface IMetanotesService_IGetScribble extends grpc.MethodDefinition<api_pb.GetScribbleRequest, api_pb.GetScribbleReply> {
    path: "/metanotes.api.Metanotes/GetScribble";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<api_pb.GetScribbleRequest>;
    requestDeserialize: grpc.deserialize<api_pb.GetScribbleRequest>;
    responseSerialize: grpc.serialize<api_pb.GetScribbleReply>;
    responseDeserialize: grpc.deserialize<api_pb.GetScribbleReply>;
}
interface IMetanotesService_ISetScribble extends grpc.MethodDefinition<api_pb.SetScribbleRequest, google_protobuf_empty_pb.Empty> {
    path: "/metanotes.api.Metanotes/SetScribble";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<api_pb.SetScribbleRequest>;
    requestDeserialize: grpc.deserialize<api_pb.SetScribbleRequest>;
    responseSerialize: grpc.serialize<google_protobuf_empty_pb.Empty>;
    responseDeserialize: grpc.deserialize<google_protobuf_empty_pb.Empty>;
}
interface IMetanotesService_IRemoveScribble extends grpc.MethodDefinition<api_pb.RemoveScribbleRequest, google_protobuf_empty_pb.Empty> {
    path: "/metanotes.api.Metanotes/RemoveScribble";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<api_pb.RemoveScribbleRequest>;
    requestDeserialize: grpc.deserialize<api_pb.RemoveScribbleRequest>;
    responseSerialize: grpc.serialize<google_protobuf_empty_pb.Empty>;
    responseDeserialize: grpc.deserialize<google_protobuf_empty_pb.Empty>;
}
interface IMetanotesService_IGetAllMetadata extends grpc.MethodDefinition<google_protobuf_empty_pb.Empty, api_pb.GetAllMetadataReply> {
    path: "/metanotes.api.Metanotes/GetAllMetadata";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<google_protobuf_empty_pb.Empty>;
    requestDeserialize: grpc.deserialize<google_protobuf_empty_pb.Empty>;
    responseSerialize: grpc.serialize<api_pb.GetAllMetadataReply>;
    responseDeserialize: grpc.deserialize<api_pb.GetAllMetadataReply>;
}
interface IMetanotesService_IGetScribblesByTextSearch extends grpc.MethodDefinition<api_pb.GetScribblesByTextSearchRequest, api_pb.GetScribblesByTextSearchReply> {
    path: "/metanotes.api.Metanotes/GetScribblesByTextSearch";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<api_pb.GetScribblesByTextSearchRequest>;
    requestDeserialize: grpc.deserialize<api_pb.GetScribblesByTextSearchRequest>;
    responseSerialize: grpc.serialize<api_pb.GetScribblesByTextSearchReply>;
    responseDeserialize: grpc.deserialize<api_pb.GetScribblesByTextSearchReply>;
}

export const MetanotesService: IMetanotesService;

export interface IMetanotesServer {
    getScribble: grpc.handleUnaryCall<api_pb.GetScribbleRequest, api_pb.GetScribbleReply>;
    setScribble: grpc.handleUnaryCall<api_pb.SetScribbleRequest, google_protobuf_empty_pb.Empty>;
    removeScribble: grpc.handleUnaryCall<api_pb.RemoveScribbleRequest, google_protobuf_empty_pb.Empty>;
    getAllMetadata: grpc.handleUnaryCall<google_protobuf_empty_pb.Empty, api_pb.GetAllMetadataReply>;
    getScribblesByTextSearch: grpc.handleUnaryCall<api_pb.GetScribblesByTextSearchRequest, api_pb.GetScribblesByTextSearchReply>;
}

export interface IMetanotesClient {
    getScribble(request: api_pb.GetScribbleRequest, callback: (error: grpc.ServiceError | null, response: api_pb.GetScribbleReply) => void): grpc.ClientUnaryCall;
    getScribble(request: api_pb.GetScribbleRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: api_pb.GetScribbleReply) => void): grpc.ClientUnaryCall;
    getScribble(request: api_pb.GetScribbleRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: api_pb.GetScribbleReply) => void): grpc.ClientUnaryCall;
    setScribble(request: api_pb.SetScribbleRequest, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    setScribble(request: api_pb.SetScribbleRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    setScribble(request: api_pb.SetScribbleRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    removeScribble(request: api_pb.RemoveScribbleRequest, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    removeScribble(request: api_pb.RemoveScribbleRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    removeScribble(request: api_pb.RemoveScribbleRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    getAllMetadata(request: google_protobuf_empty_pb.Empty, callback: (error: grpc.ServiceError | null, response: api_pb.GetAllMetadataReply) => void): grpc.ClientUnaryCall;
    getAllMetadata(request: google_protobuf_empty_pb.Empty, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: api_pb.GetAllMetadataReply) => void): grpc.ClientUnaryCall;
    getAllMetadata(request: google_protobuf_empty_pb.Empty, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: api_pb.GetAllMetadataReply) => void): grpc.ClientUnaryCall;
    getScribblesByTextSearch(request: api_pb.GetScribblesByTextSearchRequest, callback: (error: grpc.ServiceError | null, response: api_pb.GetScribblesByTextSearchReply) => void): grpc.ClientUnaryCall;
    getScribblesByTextSearch(request: api_pb.GetScribblesByTextSearchRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: api_pb.GetScribblesByTextSearchReply) => void): grpc.ClientUnaryCall;
    getScribblesByTextSearch(request: api_pb.GetScribblesByTextSearchRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: api_pb.GetScribblesByTextSearchReply) => void): grpc.ClientUnaryCall;
}

export class MetanotesClient extends grpc.Client implements IMetanotesClient {
    constructor(address: string, credentials: grpc.ChannelCredentials, options?: Partial<grpc.ClientOptions>);
    public getScribble(request: api_pb.GetScribbleRequest, callback: (error: grpc.ServiceError | null, response: api_pb.GetScribbleReply) => void): grpc.ClientUnaryCall;
    public getScribble(request: api_pb.GetScribbleRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: api_pb.GetScribbleReply) => void): grpc.ClientUnaryCall;
    public getScribble(request: api_pb.GetScribbleRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: api_pb.GetScribbleReply) => void): grpc.ClientUnaryCall;
    public setScribble(request: api_pb.SetScribbleRequest, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    public setScribble(request: api_pb.SetScribbleRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    public setScribble(request: api_pb.SetScribbleRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    public removeScribble(request: api_pb.RemoveScribbleRequest, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    public removeScribble(request: api_pb.RemoveScribbleRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    public removeScribble(request: api_pb.RemoveScribbleRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    public getAllMetadata(request: google_protobuf_empty_pb.Empty, callback: (error: grpc.ServiceError | null, response: api_pb.GetAllMetadataReply) => void): grpc.ClientUnaryCall;
    public getAllMetadata(request: google_protobuf_empty_pb.Empty, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: api_pb.GetAllMetadataReply) => void): grpc.ClientUnaryCall;
    public getAllMetadata(request: google_protobuf_empty_pb.Empty, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: api_pb.GetAllMetadataReply) => void): grpc.ClientUnaryCall;
    public getScribblesByTextSearch(request: api_pb.GetScribblesByTextSearchRequest, callback: (error: grpc.ServiceError | null, response: api_pb.GetScribblesByTextSearchReply) => void): grpc.ClientUnaryCall;
    public getScribblesByTextSearch(request: api_pb.GetScribblesByTextSearchRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: api_pb.GetScribblesByTextSearchReply) => void): grpc.ClientUnaryCall;
    public getScribblesByTextSearch(request: api_pb.GetScribblesByTextSearchRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: api_pb.GetScribblesByTextSearchReply) => void): grpc.ClientUnaryCall;
}
