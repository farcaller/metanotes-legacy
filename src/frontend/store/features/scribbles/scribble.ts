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

import { Scribble as ScribbleProto } from '../../../../common/api/api_pb';
import Ajv, { JSONSchemaType } from 'ajv';
import yaml from 'js-yaml';

export type ScribbleID = string;

export interface Attributes {
  'content-type': string;
  title?: string;
  tags?: string;

  list?: string;
  'list-before'?: ScribbleID;
  'list-after'?: ScribbleID;
  
  'mn-draft-of'?: ScribbleID;

  [x: string]: string | undefined;
}

export interface ComputedAttributes {
  tags: string[];
  list: string[];
}

export interface Scribble {
  id: ScribbleID;

  body?: string;
  binaryBodyURL?: string;
  attributes: Attributes;
  computedAttributes: ComputedAttributes;

  status: 'core' | 'syncedMetadataOnly' | 'pullingBody' | 'synced' | 'failed';
  error?: string;
  dirty?: boolean;
}

export interface SyncedScribble extends Scribble {
  body: string;
  status: 'core' | 'synced';
}

export function isSyncedScribble(scribble: Scribble): scribble is SyncedScribble {
  return scribble.status === 'core' || scribble.status === 'synced';
}

export function fromProto(s: ScribbleProto, metadataOnly: boolean): Scribble {
  const attrs = {} as Attributes;

  s.getPropsMap().forEach((v: string, k: string) => attrs[k] = v);
  const scribble: Scribble = {
    id: s.getId(),
    attributes: attrs,
    computedAttributes: {
      tags: [],
      list: []
    },

    status: metadataOnly ? 'syncedMetadataOnly' : 'synced',
  };
  if (!metadataOnly) {
    if (s.hasBinaryBody()) {
      const binaryBody = s.getBinaryBody_asU8();
      const blob = new Blob([binaryBody], { type: scribble.attributes['content-type']});
      scribble.binaryBodyURL = window.URL.createObjectURL(blob);
    } else {
      scribble.body = s.getTextBody();
    }
  }
  scribble.computedAttributes = recomputeAttributes(scribble);

  return scribble;
}

export async function toProto(s: Scribble): Promise<ScribbleProto> {
  const spb = new ScribbleProto();
  spb.setId(s.id);
  const props = spb.getPropsMap();
  for (const k of Object.keys(s.attributes)) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    props.set(k, s.attributes[k]!);
  }
  if (s.binaryBodyURL) {
    // TODO: yay browser specific bs
    const res = await fetch(s.binaryBodyURL);
    const uint8 = new Uint8Array(await res.arrayBuffer());
    spb.setBinaryBody(uint8);
  } else {
    spb.setTextBody(s.body!);
  }

  return spb;
}

const ajv = new Ajv();
const TagSchemaDefinition: JSONSchemaType<string[]> = {
  // "$schema": "https://json-schema.org/draft/2019-09/schema",
  // "$id": "https://metanotes.org/schemas/v1/tag.schema.json",
  // "title": "Metanotes tag attribute",
  "type": "array",
  "items": {
    "type": "string",
  }
};
const TagSchema = ajv.compile(TagSchemaDefinition);

const ListSchemaDefinition: JSONSchemaType<string[]> = {
  // "$schema": "https://json-schema.org/draft/2019-09/schema",
  // "$id": "https://metanotes.org/schemas/v1/tag.schema.json",
  // "title": "Metanotes list attribute",
  "type": "array",
  "items": {
    "type": "string",
  }
};
const ListSchema = ajv.compile(ListSchemaDefinition);


export function recomputeAttributes(scribble: Scribble): ComputedAttributes {
  let tags = [] as string[];
  let list = [] as string[];

  const scribbleTags = scribble.attributes.tags;
  if (scribbleTags) {
    const tagsData = yaml.load(scribbleTags) as unknown;
    if (TagSchema(tagsData)) {
      tags = tagsData;
    } else {
      console.error(`scribble ${scribble.id} has incorrectly formatted tags field:`, tagsData);
    }
  }

  const scribbleList = scribble.attributes.list;
  if (scribbleList) {
    const listData = yaml.load(scribbleList) as unknown;
    if (ListSchema(listData)) {
      list = listData;
    } else {
      console.error(`scribble ${scribble.id} has incorrectly formatted list field:`, listData);
    }
  }

  return {
    tags,
    list,
  };
}
