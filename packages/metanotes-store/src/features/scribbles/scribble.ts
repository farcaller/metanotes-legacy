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

import { Scribble as ScribbleProto } from '@metanotes/server-api/lib/api_pb';


export interface Scribble {
  id: string;

  body?: string;
  attributes: {[key: string]: string};

  status: 'core' | 'syncedMetadataOnly' | 'pullingBody' | 'synced' | 'failed';
  error?: string;
}

export interface SyncedScribble extends Scribble {
  body: string;
  status: 'core' | 'synced';
}

export function isSyncedScribble(scribble: Scribble): scribble is SyncedScribble {
  return scribble.status === 'core' || scribble.status === 'synced';
}

export function fromProto(s: ScribbleProto, metadataOnly: boolean): Scribble {
  const attrs: { [key: string]: string } = {};

  // FIXME: this is bad
  try {
    s.getAttributesMap().forEach((v, k) => attrs[k] = JSON.parse(v) as unknown as string);
  } catch (e) {
    console.log(e);
    console.log(s.getAttributesMap());
    throw e;
  }
  return {
    id: s.getId(),
    body: metadataOnly ? undefined : s.getBody(),
    attributes: attrs,

    status: metadataOnly ? 'syncedMetadataOnly' : 'synced',
  };
}