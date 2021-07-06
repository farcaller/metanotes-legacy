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

import open, { Database } from 'better-sqlite3';
import { Scribble, Version } from '../common/api/api_node_pb/src/common/api/api_pb';

import Store from './store';

describe('db', () => {
  let db: Database;
  beforeEach(() => {
    db = open(':memory:');
  });

  it('creates the versions table', () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const store = new Store(db);

    expect(db.prepare(`SELECT name FROM sqlite_master WHERE name = 'versions'`).get().name).toEqual('versions');
  });

  describe('get', () => {
    let store: Store;
    beforeEach(() => {
      store = new Store(db);
      db.exec(`INSERT INTO versions (scribble_id, version_id, body, meta) VALUES
        (
          '01F35ZYDZF1Y5BE6WHQWP463TX',
          '01F3600GJKK5V3JBJ6E35HMWBG',
          'body 1',
          '{"hello": "world", "mn-title": "hello"}'
        ),
        (
          '01F35ZYDZF1Y5BE6WHQWP463TX',
          '01F36018DC5WT42F4BDMZK6KHV',
          'body 1.1',
          '{"hello": "new world", "mn-title": "hello"}'
        ),
        ('01F35ZZSFTSAJ7STW9ZB67W5B2', '01F3600VPVKZ14W5F6FMKTJHNK', 'body 2', '{"mn-title": "world"}')
      `);
    });

    describe('getAllMetadata', () => {
      it('returns all the scribbles', () => {
        const scribbles = store.getAllMetadata().map((s) => s.toObject().scribbleId);
        expect(scribbles).toEqual(['01F35ZYDZF1Y5BE6WHQWP463TX', '01F35ZZSFTSAJ7STW9ZB67W5B2']);
      });

      it('returns one version per scribble which is the latest one', () => {
        const versions = store.getAllMetadata().map((s) => s.toObject().versionList);
        for (const version of versions) {
          expect(version).toHaveLength(1);
        }
        const versionIDs = versions.map((v) => v[0].versionId);
        expect(versionIDs).toEqual(['01F36018DC5WT42F4BDMZK6KHV', '01F3600VPVKZ14W5F6FMKTJHNK']);
      });

      it('does not return any bodies', () => {
        const versions = ([] as Version.AsObject[]).concat(
          ...store.getAllMetadata().map((s) => s.toObject().versionList),
        );
        for (const version of versions) {
          expect(version.textBody).toEqual('');
        }
      });

      describe('with drafts', () => {
        beforeEach(() => {
          db.exec(`INSERT INTO versions (scribble_id, version_id, body, meta) VALUES
            (
              '01F35ZYDZF1Y5BE6WHQWP463TX',
              '01F360SQSJE3JYV1T0P63TCY9T',
              'body 1.2 draft',
              '{"hello": "new world", "mn-draft": "true"}'
            ),
            (
              '01F35ZYDZF1Y5BE6WHQWP463TX',
              '01F360W0Z37JGX1TMTBDQ3PEAM',
              'body 1.3 draft',
              '{"hello": "new world", "mn-draft": "true"}'
            )
          `);
        });

        it('returns both the stable and the latest draft versions', () => {
          const versionIDs = store.getAllMetadata()
            .find((s) => s.getScribbleId() === '01F35ZYDZF1Y5BE6WHQWP463TX')
            ?.getVersionList()
            .map((v) => v.getVersionId());

          expect(versionIDs).toEqual(['01F36018DC5WT42F4BDMZK6KHV', '01F360W0Z37JGX1TMTBDQ3PEAM']);
        });
      });
    });

    describe('getScribble', () => {
      it('returns the requested version for the scribble', () => {
        const scribble = store.getScribble('01F35ZYDZF1Y5BE6WHQWP463TX', ['01F36018DC5WT42F4BDMZK6KHV']);

        expect(scribble.toObject()).toEqual({
          scribbleId: '01F35ZYDZF1Y5BE6WHQWP463TX',
          versionList: [{
            versionId: '01F36018DC5WT42F4BDMZK6KHV',
            textBody: 'body 1.1',
            metaMap: [['hello', 'new world'], ['mn-title', 'hello']],
          }],
        });
      });

      it('returns several versions for the scribble', () => {
        const scribble = store.getScribble('01F35ZYDZF1Y5BE6WHQWP463TX', [
          '01F36018DC5WT42F4BDMZK6KHV',
          '01F3600GJKK5V3JBJ6E35HMWBG',
        ]);

        expect(scribble.toObject()).toEqual({
          scribbleId: '01F35ZYDZF1Y5BE6WHQWP463TX',
          versionList: [{
            versionId: '01F3600GJKK5V3JBJ6E35HMWBG',
            textBody: 'body 1',
            metaMap: [['hello', 'world'], ['mn-title', 'hello']],
          },
          {
            versionId: '01F36018DC5WT42F4BDMZK6KHV',
            textBody: 'body 1.1',
            metaMap: [['hello', 'new world'], ['mn-title', 'hello']],
          }],
        });
      });
    });

    describe('putScribble', () => {
      it('saves the passed versions', () => {
        const s = new Scribble();
        s.setScribbleId('01F9YJ2M61XV9BK45C2RXPN0JW');
        const v1 = new Version();
        v1.setVersionId('01F9YJ8TJ9A8J77WCEZDBBHB2R');
        v1.setTextBody('hello');
        v1.getMetaMap().set('a', 'b');
        s.getVersionList().push(v1);
        const v2 = new Version();
        v2.setVersionId('01F9YJAV24124PTAK8TY54F6K9');
        v2.setTextBody('hello2');
        v2.getMetaMap().set('mn-draft', 'true');
        s.getVersionList().push(v2);

        store.putScribble(s);

        expect(db.prepare(`SELECT * FROM versions WHERE scribble_id = '01F9YJ2M61XV9BK45C2RXPN0JW'`).all()).toEqual([{
          scribble_id: '01F9YJ2M61XV9BK45C2RXPN0JW',
          version_id: '01F9YJ8TJ9A8J77WCEZDBBHB2R',
          body: 'hello',
          meta: '{"a":"b"}',
          is_draft: 0,
        }, {
          scribble_id: '01F9YJ2M61XV9BK45C2RXPN0JW',
          version_id: '01F9YJAV24124PTAK8TY54F6K9',
          body: 'hello2',
          meta: '{"mn-draft":"true"}',
          is_draft: 1,
        }]);
      });
    });
  });
});
