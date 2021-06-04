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
import { TitleKey } from '../interface/metadata';

describe('fromCoreScribble', () => {
  let coreScribble: CoreScribble;

  beforeEach(() => {
    coreScribble = {
      id: '01F35516BMJFC42SGG5VTPSWJV',
      body: 'hello',
      meta: { abc: 'def', 'mn-title': 'test' },
    };
  });

  test('it builds a scribble from core scribble', () => {
    const scribble = Scribble.fromCoreScribble(undefined as unknown as ScribblesStore, coreScribble);

    expect(scribble.title).toEqual('test');
    expect(scribble.scribbleID).toEqual('01F35516BMJFC42SGG5VTPSWJV');
  });

  test('it adds a core version for a scribble built from core scribble', () => {
    const scribble = Scribble.fromCoreScribble(undefined as unknown as ScribblesStore, coreScribble);

    expect(scribble.latestStableVersion?.versionID).toEqual('0000000000JFC42SGG5VTPCORE');
  });

  test('it builds a version from core scribble', () => {
    const scribble = Scribble.fromCoreScribble(undefined as unknown as ScribblesStore, coreScribble);

    expect(scribble.latestStableVersion?.body).toEqual('hello');
    expect(scribble.latestStableVersion?.getMeta('abc')).toEqual('def');
  });
});

describe('fromProto', () => {
  let spb: pb.Scribble;

  beforeEach(() => {
    spb = new pb.Scribble();
    spb.setScribbleId('01F35516BMJFC42SGG5VTPSWJV');
    const vpb = new pb.Version();
    vpb.setVersionId('01F357DS7D3VKNQYB3EXJF265Q');
    vpb.setTextBody('hello');
    vpb.getMetaMap().set('abc', 'def');
    vpb.getMetaMap().set('mn-title', 'test');
    spb.setVersionList([vpb]);
  });

  test('it builds a scribble from a proto', () => {
    const scribble = Scribble.fromProto(undefined as unknown as ScribblesStore, spb);

    expect(scribble.title).toEqual('test');
    expect(scribble.scribbleID).toEqual('01F35516BMJFC42SGG5VTPSWJV');
  });

  test('it unsets the scribble title if it came empty from the proto', () => {
    spb.getVersionList()[0].getMetaMap().del('mn-title');
    const scribble = Scribble.fromProto(undefined as unknown as ScribblesStore, spb);

    expect(scribble.title).toEqual('');
  });

  test('it builds a version from a proto', () => {
    const scribble = Scribble.fromProto(undefined as unknown as ScribblesStore, spb);

    expect(scribble.latestStableVersion?.versionID).toEqual('01F357DS7D3VKNQYB3EXJF265Q');
    expect(scribble.latestStableVersion?.body).toEqual('hello');
    expect(scribble.latestStableVersion?.getMeta('abc')).toEqual('def');
  });
});

describe('JSModule', () => {
  test('it evals the js module and returns the default export', () => {
    const store = new ScribblesStore(undefined as unknown as StorageAPI);
    const scribble = Scribble.fromCoreScribble(store, {
      id: '01F35516BMJFC42SGG5VTPSWJV',
      body: 'export default function() { return 42; }',
      meta: { abc: 'def', 'mn-title': 'test' },
    });

    const jsmod = scribble.JSModule<() => number>();

    expect(jsmod()).toEqual(42);
  });
});

describe('computedMetadata', () => {
  it('returns computed metadata for tags', () => {
    const scribble = Scribble.fromCoreScribble(undefined as unknown as ScribblesStore, {
      id: '01F35516BMJFC42SGG5VTPSWJV',
      body: '',
      meta: { tags: '["hello", "world"]', 'mn-title': 'test' },
    });

    expect(scribble.latestStableVersion?.computedMeta.tags).toEqual(['hello', 'world']);
  });

  it('returns empty tags if there is no source meta', () => {
    const scribble = Scribble.fromCoreScribble(undefined as unknown as ScribblesStore, {
      id: '01F35516BMJFC42SGG5VTPSWJV',
      body: '',
      meta: {
        'mn-title': 'test',
      },
    });

    expect(scribble.latestStableVersion?.computedMeta.tags).toEqual([]);
  });

  it('returns empty tags if the source meta is malformed', () => {
    const scribble = Scribble.fromCoreScribble(undefined as unknown as ScribblesStore, {
      id: '01F35516BMJFC42SGG5VTPSWJV',
      body: '',
      meta: { tags: 'broken json', 'mn-title': 'test' },
    });

    expect(scribble.latestStableVersion?.computedMeta.tags).toEqual([]);
  });
});

describe('versions', () => {
  it('creates a new draft version for scribble with no versions', () => {
    const store = {
      addScribble: () => true,
    } as unknown as ScribblesStore;
    const scribble = new Scribble(store);

    const draftID = scribble.createDraftVersion();

    expect(scribble.versionByID(draftID)?.isDraft).toBe(true);
    expect(scribble.versionByID(draftID)?.body).toBe('');
  });

  it('creates new draft versions', () => {
    const scribble = Scribble.fromCoreScribble(undefined as unknown as ScribblesStore, {
      id: '01F35516BMJFC42SGG5VTPSWJV',
      body: 'test body',
      meta: { tags: '["hello", "world"]', 'mn-title': 'test' },
    });

    const draftID = scribble.createDraftVersion();

    expect(scribble.versionByID(draftID)?.isDraft).toBe(true);
    expect(scribble.versionByID(draftID)?.body).toBe('test body');
  });

  it('returns the non-draft version as a stable version', () => {
    const scribble = Scribble.fromCoreScribble(undefined as unknown as ScribblesStore, {
      id: '01F35516BMJFC42SGG5VTPSWJV',
      body: '',
      meta: { tags: '["hello", "world"]', 'mn-title': 'test' },
    });
    scribble.createDraftVersion();

    expect(scribble.latestStableVersion?.versionID).toBe('0000000000JFC42SGG5VTPCORE');
  });

  it('returns the latest draft version is there is a draft', () => {
    const scribble = Scribble.fromCoreScribble(undefined as unknown as ScribblesStore, {
      id: '01F35516BMJFC42SGG5VTPSWJV',
      body: '',
      meta: { tags: '["hello", "world"]', 'mn-title': 'test' },
    });
    const draftID = scribble.createDraftVersion();

    expect(scribble.latestVersion.versionID).toBe(draftID);
  });

  describe('commit', () => {
    it('commits the stable version', () => {
      const store = new ScribblesStore(undefined as unknown as StorageAPI);
      const scribble = store.createDraftScribble();

      scribble.createStableVersion('body', new Map().set(TitleKey, 'hello'));

      expect(store.scribbleByTitle('hello')?.latestStableVersion?.body).toEqual('body');
    });

    it('commits the stable version with empty title', () => {
      const store = new ScribblesStore(undefined as unknown as StorageAPI);
      const scribble = store.createDraftScribble();

      scribble.createStableVersion('body', new Map().set(TitleKey, ''));

      expect(store.scribbleByID(scribble.scribbleID)?.latestStableVersion?.body).toEqual('body');
    });

    it('throws if the commit has a title conflict', () => {
      const store = new ScribblesStore(undefined as unknown as StorageAPI);
      store.createDraftScribble().createStableVersion('body', new Map().set(TitleKey, 'hello'));

      expect(() => {
        store.createDraftScribble().createStableVersion('new body', new Map().set(TitleKey, 'hello'));
      }).toThrow();
    });

    it(`keeps the old scribble accessible if there's a title conflict`, () => {
      const store = new ScribblesStore(undefined as unknown as StorageAPI);
      store.createDraftScribble().createStableVersion('body', new Map().set(TitleKey, 'hello'));

      try {
        store.createDraftScribble().createStableVersion('new body', new Map().set(TitleKey, 'hello'));
      // eslint-disable-next-line no-empty
      } catch {}

      expect(store.scribbleByTitle('hello')?.latestStableVersion?.body).toEqual('body');
    });

    it(`doesn't retain the new version if it failed to commit`, () => {
      const store = new ScribblesStore(undefined as unknown as StorageAPI);
      store.createDraftScribble().createStableVersion('body', new Map().set(TitleKey, 'collision'));
      const scribble = store.createDraftScribble();
      scribble.createStableVersion('commit 1', new Map().set(TitleKey, 'old title'));

      try {
        scribble.createStableVersion('commit 2', new Map().set(TitleKey, 'collision'));
        // eslint-disable-next-line no-empty
      } catch { }

      expect(store.scribbleByID(scribble.scribbleID)?.latestVersion?.body).toEqual('commit 1');
    });

    it(`doesn't allow to access the scribble by the old title after committing`, () => {
      const store = new ScribblesStore(undefined as unknown as StorageAPI);
      const scribble = store.createDraftScribble();
      scribble.createStableVersion('body', new Map().set(TitleKey, 'first title'));
      scribble.createStableVersion('body', new Map().set(TitleKey, 'second title'));

      expect(store.scribbleByTitle('first title')).toBeUndefined();
    });
  });
});
