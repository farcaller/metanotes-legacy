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

import { Database } from 'better-sqlite3';
import { Map as PbMap } from 'google-protobuf';

import * as pb from '../common/api/api_node_pb/src/common/api/api_pb';
import syncDBSchema from './schema';

function JSONStringToMeta(s: string, m: PbMap<string, string>) {
  const propsJson = JSON.parse(s) as { [key: string]: string };
  for (const k of Object.keys(propsJson)) {
    m.set(k, propsJson[k]);
  }
}

function metaToJSONString(m: PbMap<string, string>): string {
  const propsJson = {} as { [key: string]: string };
  m.forEach((v, k) => { propsJson[k] = v; });
  return JSON.stringify(propsJson);
}

export default class Store {
  constructor(private readonly db: Database) {
    syncDBSchema(this.db);
  }

  getScribble(scribbleID: string, versionIDs: string[]): pb.Scribble {
    const stmt = this.db.prepare(`
      SELECT
          version_id, body, meta
      FROM
          versions
      WHERE
          scribble_id = ?
          AND version_id IN (${Array(versionIDs.length).fill('?').join(', ')})
    `);

    const scribble = new pb.Scribble();
    scribble.setScribbleId(scribbleID);

    for (const row of stmt.iterate(scribbleID, ...versionIDs)) {
      const version = new pb.Version();
      version.setVersionId(row.version_id);
      version.setTextBody(row.body);
      JSONStringToMeta(row.meta, version.getMetaMap());
      scribble.addVersion(version);
    }

    return scribble;
  }

  getAllMetadata(): pb.Scribble[] {
    const scribbles = new Map<string, pb.Scribble>();
    for (const row of this.db.prepare(`
SELECT
    scribble_id AS scribble_id, MAX(version_id) AS version_id, meta AS meta
FROM
    versions
WHERE
    is_draft = false
GROUP BY
    scribble_id
UNION
SELECT
    scribble_id AS scribble_id, MAX(version_id) AS version_id, meta AS meta
FROM
    versions
WHERE
    is_draft = true
GROUP BY
    scribble_id
    `).iterate()) {
      let scribble = scribbles.get(row.scribble_id);
      if (!scribble) {
        scribble = new pb.Scribble();
        scribble.setScribbleId(row.scribble_id);
        scribbles.set(row.scribble_id, scribble);
      }
      const version = new pb.Version();
      version.setVersionId(row.version_id);
      JSONStringToMeta(row.meta, version.getMetaMap());
      scribble.addVersion(version);
    }

    return Array.from(scribbles.values());
  }

  putScribble(scribble: pb.Scribble) {
    const stmt = this.db.prepare(`
INSERT INTO
    versions (scribble_id, version_id, body, meta)
VALUES
    (?, ?, ?, ?)
    `);

    const scribbleId = scribble.getScribbleId();

    for (const version of scribble.getVersionList()) {
      const versionId = version.getVersionId();
      const body = version.getTextBody();
      const meta = metaToJSONString(version.getMetaMap());

      stmt.run(scribbleId, versionId, body, meta);
    }
  }
}
