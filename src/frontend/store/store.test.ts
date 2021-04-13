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
import * as pb from '../../common/api/api_pb';
import { FetchFailed } from './fetch_status';

test('it returns core scribbles by id', () => {
  const store = new ScribbleStore(undefined as unknown as StorageAPI);

  store.loadCoreScribbles([{
    id: '01F35516BMJFC42SGG5VTPSWJV',
    title: 'test',
    body: 'hello',
    meta: {},
  }]);

  expect(store.scribbleByID('01F35516BMJFC42SGG5VTPSWJV')?.title).toEqual('test');
});

test('it returns core scribbles by title', () => {
  const store = new ScribbleStore(undefined as unknown as StorageAPI);

  store.loadCoreScribbles([{
    id: '01F35516BMJFC42SGG5VTPSWJV',
    title: 'test',
    body: 'hello',
    meta: {},
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
        spb.setTitle('test');
        const vpb = new pb.Version();
        vpb.setVersionId('01F357DS7D3VKNQYB3EXJF265Q');
        vpb.setTextBody('hello');
        vpb.getMetaMap().set('abc', 'def');
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

    expect(store.scribbleByID('01F35516BMJFC42SGG5VTPSWJV')?.title).toEqual('test');
  });

  test('it shadows the core scribble version on fetch', async () => {
    const store = new ScribbleStore(api);
    store.loadCoreScribbles([{
      id: '01F35516BMJFC42SGG5VTPSWJV',
      title: 'core',
      body: 'hello',
      meta: {},
    }]);

    await store.fetchScribbles();

    expect((store.fetchStatus as FetchFailed).error).toBeUndefined();
    expect(store.scribbleByID('01F35516BMJFC42SGG5VTPSWJV')?.title).toEqual('test');
  });
});
