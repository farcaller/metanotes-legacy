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

import Scribble from './scribble';
import * as pb from '../../../common/api/api_web_pb/src/common/api/api_pb';
import { CoreScribble } from '../interface/core_scribble';
import ScribblesStore from '../store';
import { StorageAPI } from '../client';

describe('fromCoreScribble', () => {
  let coreScribble: CoreScribble;

  beforeEach(() => {
    coreScribble = {
      id: '01F35516BMJFC42SGG5VTPSWJV',
      title: 'test',
      body: 'hello',
      meta: { abc: 'def' },
    };
  });

  test('it builds a scribble from core scribble', () => {
    const scribble = Scribble.fromCoreScribble(undefined as unknown as ScribblesStore, coreScribble);

    expect(scribble.title).toEqual('test');
    expect(scribble.scribbleID).toEqual('01F35516BMJFC42SGG5VTPSWJV');
  });

  test('it adds a core version for a scribble built from core scribble', () => {
    const scribble = Scribble.fromCoreScribble(undefined as unknown as ScribblesStore, coreScribble);

    expect(scribble.latestStableVersion.versionID).toEqual('0000000000JFC42SGG5VTPCORE');
  });

  test('it builds a version from core scribble', () => {
    const scribble = Scribble.fromCoreScribble(undefined as unknown as ScribblesStore, coreScribble);

    expect(scribble.latestStableVersion.body).toEqual('hello');
    expect(scribble.latestStableVersion.getMeta('abc')).toEqual('def');
  });
});

describe('fromProto', () => {
  let spb: pb.Scribble;

  beforeEach(() => {
    spb = new pb.Scribble();
    spb.setScribbleId('01F35516BMJFC42SGG5VTPSWJV');
    spb.setTitle('test');
    const vpb = new pb.Version();
    vpb.setVersionId('01F357DS7D3VKNQYB3EXJF265Q');
    vpb.setTextBody('hello');
    vpb.getMetaMap().set('abc', 'def');
    spb.setVersionList([vpb]);
  });

  test('it builds a scribble from a proto', () => {
    const scribble = Scribble.fromProto(undefined as unknown as ScribblesStore, spb);

    expect(scribble.title).toEqual('test');
    expect(scribble.scribbleID).toEqual('01F35516BMJFC42SGG5VTPSWJV');
  });

  test('it unsets the scribble title if it came empty from the proto', () => {
    spb.setTitle('');
    const scribble = Scribble.fromProto(undefined as unknown as ScribblesStore, spb);

    expect(scribble.title).toBeUndefined();
  });

  test('it builds a version from a proto', () => {
    const scribble = Scribble.fromProto(undefined as unknown as ScribblesStore, spb);

    expect(scribble.latestStableVersion.versionID).toEqual('01F357DS7D3VKNQYB3EXJF265Q');
    expect(scribble.latestStableVersion.body).toEqual('hello');
    expect(scribble.latestStableVersion.getMeta('abc')).toEqual('def');
  });
});

describe('JSModule', () => {
  test('it evals the js module and returns the default export', () => {
    const store = new ScribblesStore(undefined as unknown as StorageAPI);
    const scribble = Scribble.fromCoreScribble(store, {
      id: '01F35516BMJFC42SGG5VTPSWJV',
      title: 'test',
      body: 'export default function() { return 42; }',
      meta: { abc: 'def' },
    });

    const jsmod = scribble.JSModule<() => number>();

    expect(jsmod()).toEqual(42);
  });
});

describe('computedMetadata', () => {
  it('returns computed metadata for tags', () => {
    const scribble = Scribble.fromCoreScribble(undefined as unknown as ScribblesStore, {
      id: '01F35516BMJFC42SGG5VTPSWJV',
      title: 'test',
      body: '',
      meta: { tags: '["hello", "world"]' },
    });

    expect(scribble.latestStableVersion.computedMeta.tags).toEqual(['hello', 'world']);
  });

  it('returns empty tags if there is no source meta', () => {
    const scribble = Scribble.fromCoreScribble(undefined as unknown as ScribblesStore, {
      id: '01F35516BMJFC42SGG5VTPSWJV',
      title: 'test',
      body: '',
      meta: {},
    });

    expect(scribble.latestStableVersion.computedMeta.tags).toEqual([]);
  });

  it('returns empty tags if the source meta is malformed', () => {
    const scribble = Scribble.fromCoreScribble(undefined as unknown as ScribblesStore, {
      id: '01F35516BMJFC42SGG5VTPSWJV',
      title: 'test',
      body: '',
      meta: { tags: 'broken json' },
    });

    expect(scribble.latestStableVersion.computedMeta.tags).toEqual([]);
  });
});
