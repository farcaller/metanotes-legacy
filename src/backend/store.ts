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

import { Database, Statement } from 'better-sqlite3';
import { status } from '@grpc/grpc-js';
import { Map as PbMap } from 'google-protobuf';

import * as pb from '../common/api/api_pb';
import MakeStatus from './error';
import syncDBSchema from './schema';

function setScribblePropsFromJSON(s: string, m: PbMap<string, string>) {
  const propsJson = JSON.parse(s) as { [key: string]: string };
  for (const k of Object.keys(propsJson)) {
    m.set(k, propsJson[k]);
  }
}

export default class Store {
  private getScribbleStmt: Statement<{ scribbleID: string }>;

  constructor(private readonly db: Database) {
    this.db.pragma('foreign_keys = ON');

    syncDBSchema(this.db);

    this.getScribbleStmt = this.db.prepare(`
SELECT
    scribble_id, title
FROM
    scribbles
WHERE
    scribble_id = @scribbleID
    `);
  }

  getScribble(scribbleID: string, versionIDs: string[]): pb.Scribble {
    const scribbleRow = this.getScribbleStmt.get({ scribbleID });

    if (!scribbleRow) {
      throw MakeStatus(status.NOT_FOUND, `scribble '${scribbleID}' was not found`);
    }

    const scribble = new pb.Scribble();
    scribble.setScribbleId(scribbleRow.scribble_id);
    if (scribbleRow.title) {
      scribble.setTitle(scribbleRow.title);
    }

    const stmt = this.db.prepare(`
      SELECT
          version_id, body, meta
      FROM
          versions
      WHERE
          scribble_id = ?
          AND version_id IN (${Array(versionIDs.length).fill('?').join(', ')})
    `);

    for (const row of stmt.iterate(scribbleID, ...versionIDs)) {
      const version = new pb.Version();
      version.setVersionId(row.version_id);
      version.setTextBody(row.body);
      setScribblePropsFromJSON(row.meta, version.getMetaMap());
      scribble.addVersion(version);
    }

    return scribble;
  }

  getAllMetadata(): pb.Scribble[] {
    const scribbles = new Map<string, pb.Scribble>();
    for (const row of this.db.prepare(`
SELECT
    scribbles.scribble_id AS scribble_id, MAX(version_id) AS version_id, title AS title, meta AS meta
FROM
    scribbles
INNER JOIN
    versions ON scribbles.scribble_id = versions.scribble_id
WHERE
    is_draft = false
GROUP BY
    scribbles.scribble_id
UNION
SELECT
    scribbles.scribble_id AS scribble_id, MAX(version_id) AS version_id, title AS title, meta AS meta
FROM
    scribbles
INNER JOIN
    versions ON scribbles.scribble_id = versions.scribble_id
WHERE
    is_draft = true
GROUP BY
    scribbles.scribble_id
    `).iterate()) {
      let scribble = scribbles.get(row.scribble_id);
      if (!scribble) {
        scribble = new pb.Scribble();
        scribble.setScribbleId(row.scribble_id);
        if (row.title) {
          scribble.setTitle(row.title);
        }
        scribbles.set(row.scribble_id, scribble);
      }
      const version = new pb.Version();
      version.setVersionId(row.version_id);
      setScribblePropsFromJSON(row.meta, version.getMetaMap());
      scribble.addVersion(version);
    }

    return Array.from(scribbles.values());
  }
}
