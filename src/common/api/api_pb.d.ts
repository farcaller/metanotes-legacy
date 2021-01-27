// package: metanotes.api
// file: api.proto

/* tslint:disable */
/* eslint-disable */

import * as jspb from "google-protobuf";
import * as google_protobuf_empty_pb from "google-protobuf/google/protobuf/empty_pb";

export class Scribble extends jspb.Message { 
    getId(): string;
    setId(value: string): Scribble;


    hasTextBody(): boolean;
    clearTextBody(): void;
    getTextBody(): string;
    setTextBody(value: string): Scribble;


    hasBinaryBody(): boolean;
    clearBinaryBody(): void;
    getBinaryBody(): Uint8Array | string;
    getBinaryBody_asU8(): Uint8Array;
    getBinaryBody_asB64(): string;
    setBinaryBody(value: Uint8Array | string): Scribble;


    getPropsMap(): jspb.Map<string, string>;
    clearPropsMap(): void;


    getBodyCase(): Scribble.BodyCase;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): Scribble.AsObject;
    static toObject(includeInstance: boolean, msg: Scribble): Scribble.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: Scribble, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): Scribble;
    static deserializeBinaryFromReader(message: Scribble, reader: jspb.BinaryReader): Scribble;
}

export namespace Scribble {
    export type AsObject = {
        id: string,
        textBody: string,
        binaryBody: Uint8Array | string,

        propsMap: Array<[string, string]>,
    }

    export enum BodyCase {
        BODY_NOT_SET = 0,
    
    TEXT_BODY = 3,

    BINARY_BODY = 4,

    }

}

export class GetScribbleRequest extends jspb.Message { 
    getId(): string;
    setId(value: string): GetScribbleRequest;


    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): GetScribbleRequest.AsObject;
    static toObject(includeInstance: boolean, msg: GetScribbleRequest): GetScribbleRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: GetScribbleRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): GetScribbleRequest;
    static deserializeBinaryFromReader(message: GetScribbleRequest, reader: jspb.BinaryReader): GetScribbleRequest;
}

export namespace GetScribbleRequest {
    export type AsObject = {
        id: string,
    }
}

export class GetScribbleReply extends jspb.Message { 

    hasScribble(): boolean;
    clearScribble(): void;
    getScribble(): Scribble | undefined;
    setScribble(value?: Scribble): GetScribbleReply;


    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): GetScribbleReply.AsObject;
    static toObject(includeInstance: boolean, msg: GetScribbleReply): GetScribbleReply.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: GetScribbleReply, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): GetScribbleReply;
    static deserializeBinaryFromReader(message: GetScribbleReply, reader: jspb.BinaryReader): GetScribbleReply;
}

export namespace GetScribbleReply {
    export type AsObject = {
        scribble?: Scribble.AsObject,
    }
}

export class GetAllMetadataReply extends jspb.Message { 
    clearScribbleList(): void;
    getScribbleList(): Array<Scribble>;
    setScribbleList(value: Array<Scribble>): GetAllMetadataReply;
    addScribble(value?: Scribble, index?: number): Scribble;


    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): GetAllMetadataReply.AsObject;
    static toObject(includeInstance: boolean, msg: GetAllMetadataReply): GetAllMetadataReply.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: GetAllMetadataReply, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): GetAllMetadataReply;
    static deserializeBinaryFromReader(message: GetAllMetadataReply, reader: jspb.BinaryReader): GetAllMetadataReply;
}

export namespace GetAllMetadataReply {
    export type AsObject = {
        scribbleList: Array<Scribble.AsObject>,
    }
}

export class SetScribbleRequest extends jspb.Message { 

    hasScribble(): boolean;
    clearScribble(): void;
    getScribble(): Scribble | undefined;
    setScribble(value?: Scribble): SetScribbleRequest;


    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): SetScribbleRequest.AsObject;
    static toObject(includeInstance: boolean, msg: SetScribbleRequest): SetScribbleRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: SetScribbleRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): SetScribbleRequest;
    static deserializeBinaryFromReader(message: SetScribbleRequest, reader: jspb.BinaryReader): SetScribbleRequest;
}

export namespace SetScribbleRequest {
    export type AsObject = {
        scribble?: Scribble.AsObject,
    }
}

export class RemoveScribbleRequest extends jspb.Message { 
    getId(): string;
    setId(value: string): RemoveScribbleRequest;


    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): RemoveScribbleRequest.AsObject;
    static toObject(includeInstance: boolean, msg: RemoveScribbleRequest): RemoveScribbleRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: RemoveScribbleRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): RemoveScribbleRequest;
    static deserializeBinaryFromReader(message: RemoveScribbleRequest, reader: jspb.BinaryReader): RemoveScribbleRequest;
}

export namespace RemoveScribbleRequest {
    export type AsObject = {
        id: string,
    }
}

export class GetScribblesByTextSearchRequest extends jspb.Message { 
    getQuery(): string;
    setQuery(value: string): GetScribblesByTextSearchRequest;


    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): GetScribblesByTextSearchRequest.AsObject;
    static toObject(includeInstance: boolean, msg: GetScribblesByTextSearchRequest): GetScribblesByTextSearchRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: GetScribblesByTextSearchRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): GetScribblesByTextSearchRequest;
    static deserializeBinaryFromReader(message: GetScribblesByTextSearchRequest, reader: jspb.BinaryReader): GetScribblesByTextSearchRequest;
}

export namespace GetScribblesByTextSearchRequest {
    export type AsObject = {
        query: string,
    }
}

export class GetScribblesByTextSearchReply extends jspb.Message { 
    clearResultList(): void;
    getResultList(): Array<GetScribblesByTextSearchReply.SearchResult>;
    setResultList(value: Array<GetScribblesByTextSearchReply.SearchResult>): GetScribblesByTextSearchReply;
    addResult(value?: GetScribblesByTextSearchReply.SearchResult, index?: number): GetScribblesByTextSearchReply.SearchResult;


    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): GetScribblesByTextSearchReply.AsObject;
    static toObject(includeInstance: boolean, msg: GetScribblesByTextSearchReply): GetScribblesByTextSearchReply.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: GetScribblesByTextSearchReply, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): GetScribblesByTextSearchReply;
    static deserializeBinaryFromReader(message: GetScribblesByTextSearchReply, reader: jspb.BinaryReader): GetScribblesByTextSearchReply;
}

export namespace GetScribblesByTextSearchReply {
    export type AsObject = {
        resultList: Array<GetScribblesByTextSearchReply.SearchResult.AsObject>,
    }


    export class SearchResult extends jspb.Message { 
        getId(): string;
        setId(value: string): SearchResult;

        getSnippet(): string;
        setSnippet(value: string): SearchResult;


        serializeBinary(): Uint8Array;
        toObject(includeInstance?: boolean): SearchResult.AsObject;
        static toObject(includeInstance: boolean, msg: SearchResult): SearchResult.AsObject;
        static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
        static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
        static serializeBinaryToWriter(message: SearchResult, writer: jspb.BinaryWriter): void;
        static deserializeBinary(bytes: Uint8Array): SearchResult;
        static deserializeBinaryFromReader(message: SearchResult, reader: jspb.BinaryReader): SearchResult;
    }

    export namespace SearchResult {
        export type AsObject = {
            id: string,
            snippet: string,
        }
    }

}
