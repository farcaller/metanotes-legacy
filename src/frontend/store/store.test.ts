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

import { StorageAPI } from './client';
import ScribbleStore from './store';
import * as pb from '../../common/api/api_web_pb/src/common/api/api_pb';
import { FetchFailed } from './fetch_status';
import { Scribble } from './interface/scribble';

test('it returns core scribbles by id', () => {
  const store = new ScribbleStore(undefined as unknown as StorageAPI);

  store.loadCoreScribbles([{
    id: '01F35516BMJFC42SGG5VTPSWJV',
    body: 'hello',
    meta: {
      'mn-title': 'test',
    },
  }]);

  expect(store.scribbleByID('01F35516BMJFC42SGG5VTPSWJV')?.title).toEqual('test');
});

test('it returns core scribbles by title', () => {
  const store = new ScribbleStore(undefined as unknown as StorageAPI);

  store.loadCoreScribbles([{
    id: '01F35516BMJFC42SGG5VTPSWJV',
    body: 'hello',
    meta: {
      'mn-title': 'test',
    },
  }]);

  expect(store.scribbleByTitle('test')?.scribbleID).toEqual('01F35516BMJFC42SGG5VTPSWJV');
});

describe('fetchScribbles', () => {
  let api: StorageAPI;

  beforeEach(() => {
    api = {
      getAllMetadata(): Promise<pb.Scribble[]> {
        const spb = new pb.Scribble();
        spb.setScribbleId('01F35516BMJFC42SGG5VTPSWJV');
        const vpb = new pb.Version();
        vpb.setVersionId('01F357DS7D3VKNQYB3EXJF265Q');
        vpb.setTextBody('hello');
        vpb.getMetaMap().set('abc', 'def');
        vpb.getMetaMap().set('mn-title', 'remote title');
        spb.setVersionList([vpb]);
        return Promise.resolve([spb]);
      },
      getScribble(_scribbleID: string, _versionIDs: string[]): Promise<pb.Scribble> {
        return Promise.reject(Error('not implemented'));
      },
    };
  });

  test('it fetches the remote scribbles', async () => {
    const store = new ScribbleStore(api);

    await store.fetchScribbles();

    expect(store.scribbleByID('01F35516BMJFC42SGG5VTPSWJV')?.title).toEqual('remote title');
  });

  test('it shadows the core scribble version on fetch', async () => {
    const store = new ScribbleStore(api);
    store.loadCoreScribbles([{
      id: '01F35516BMJFC42SGG5VTPSWJV',
      body: 'hello',
      meta: {
        'mn-title': 'core',
      },
    }]);

    await store.fetchScribbles();

    expect((store.fetchStatus as FetchFailed).error).toBeUndefined();
    expect(store.scribbleByID('01F35516BMJFC42SGG5VTPSWJV')?.title).toEqual('remote title');
  });
});

describe('scribblesByTag', () => {
  let store: ScribbleStore;

  beforeEach(() => {
    store = new ScribbleStore(undefined as unknown as StorageAPI);
  });

  const makeScribble = (id: string, title?: string, meta: { [key: string]: string } = {}) => {
    if (title) {
      meta['mn-title'] = title;
    }
    store.loadCoreScribbles([{
      id,
      body: '',
      meta,
    }]);
  };

  const getIDs = (scribbles: Scribble[]) => scribbles.map((s) => s.scribbleID);

  test('it sorts tags by title', () => {
    makeScribble('3', '3', { tags: '["hello"]' });
    makeScribble('2', '2', { tags: '["hello"]' });
    makeScribble('1', '1', { tags: '["hello"]' });

    const selection = store.scribblesByTag('hello');

    expect(getIDs(selection)).toEqual(['1', '2', '3']);
  });

  test('it includes the `list`-ed scribbles first', () => {
    makeScribble('3', '3', { tags: '["hello"]' });
    makeScribble('2', '2', { tags: '["hello"]' });
    makeScribble('1', '1', { tags: '["hello"]' });
    makeScribble('4', 'hello', { list: '["3"]' });

    const selection = store.scribblesByTag('hello');

    expect(getIDs(selection)).toEqual(['3', '1', '2']);
  });

  test('it includes the untitled scribbles last', () => {
    makeScribble('3', '3', { tags: '["hello"]' });
    makeScribble('2', undefined, { tags: '["hello"]' });
    makeScribble('1', '1', { tags: '["hello"]' });

    const selection = store.scribblesByTag('hello');

    expect(getIDs(selection)).toEqual(['1', '3', '2']);
  });

  test('it puts the scribble with and empty `list-before` first', () => {
    makeScribble('3', '3', { tags: '["hello"]', 'list-before': '' });
    makeScribble('2', '2', { tags: '["hello"]' });
    makeScribble('1', '1', { tags: '["hello"]' });

    const selection = store.scribblesByTag('hello');

    expect(getIDs(selection)).toEqual(['3', '1', '2']);
  });

  test('it puts the scribble with and empty `list-after` last', () => {
    makeScribble('3', '3', { tags: '["hello"]' });
    makeScribble('2', '2', { tags: '["hello"]', 'list-after': '' });
    makeScribble('1', '1', { tags: '["hello"]' });

    const selection = store.scribblesByTag('hello');

    expect(getIDs(selection)).toEqual(['1', '3', '2']);
  });

  test('it puts the scribble before its `list-before`', () => {
    makeScribble('5', '5', { tags: '["hello"]' });
    makeScribble('4', '4', { tags: '["hello"]' });
    makeScribble('3', '3', { tags: '["hello"]', 'list-before': '2' });
    makeScribble('2', '2', { tags: '["hello"]', 'list-before': '' });
    makeScribble('1', '1', { tags: '["hello"]' });

    const selection = store.scribblesByTag('hello');

    expect(getIDs(selection)).toEqual(['3', '2', '1', '4', '5']);
  });

  test('it puts the scribble after its `list-after`', () => {
    makeScribble('5', '5', { tags: '["hello"]' });
    makeScribble('4', '4', { tags: '["hello"]' });
    makeScribble('3', '3', { tags: '["hello"]', 'list-after': '2' });
    makeScribble('2', '2', { tags: '["hello"]', 'list-before': '' });
    makeScribble('1', '1', { tags: '["hello"]' });

    const selection = store.scribblesByTag('hello');

    expect(getIDs(selection)).toEqual(['2', '3', '1', '4', '5']);
  });

  test('it puts the scribble after its `list-after` in the very end', () => {
    makeScribble('5', '5', { tags: '["hello"]' });
    makeScribble('4', '4', { tags: '["hello"]' });
    makeScribble('3', '3', { tags: '["hello"]', 'list-after': '2' });
    makeScribble('2', '2', { tags: '["hello"]', 'list-after': '' });
    makeScribble('1', '1', { tags: '["hello"]' });

    const selection = store.scribblesByTag('hello');

    expect(getIDs(selection)).toEqual(['1', '4', '5', '2', '3']);
  });

  test('it correctly includes the first found tagged scribble', () => {
    makeScribble('1', '1', { tags: '["hello"]' });
    makeScribble('3', '3', { tags: '["hello"]' });
    makeScribble('2', '2', { tags: '["hello"]' });
    makeScribble('4', 'hello', { list: '["1", "2", "3"]' });

    const selection = store.scribblesByTag('hello');

    expect(getIDs(selection)).toEqual(['1', '2', '3']);
  });
});
