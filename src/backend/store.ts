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

import path from 'path';

import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import SQL from 'sql-template-strings';
import { status } from '@grpc/grpc-js';
import { Map as PbMap } from 'google-protobuf';

import * as pb from 'metanotes/src/common/api/api_pb';


function setScribblePropsFromJSON(s: string, m: PbMap<string, string>) {
  const propsJson = JSON.parse(s) as { [key: string]: string };
  for (const k of Object.keys(propsJson)) {
    m.set(k, propsJson[k]);
  }
}

export class Store {
  private db?: Database<sqlite3.Database, sqlite3.Statement>;

  constructor(private readonly basePath: string) {}

  async init(): Promise<void> {
    this.db = await open({
      filename: this.basePath,
      driver: sqlite3.Database
    });
    await this.db.migrate({
      migrationsPath: path.resolve(__dirname, '../migrations'),
    });
    await this.db.run(SQL`PRAGMA foreign_keys = ON`);
  }

  async getScribble(id: string): Promise<pb.Scribble> {
    const scribbleRow = await this.db!.get<{ id: string, body: string|Uint8Array, typeof_body: 'text'|'blob', props: string }>(
      SQL`SELECT id, body, typeof(body) AS typeof_body, props FROM Scribbles WHERE id = ${id}`);

    if (!scribbleRow) {
      throw {
        code: status.NOT_FOUND,
        message: `scribble '${id}' was not found`,
      };
    }

    const sc = new pb.Scribble();
    if (scribbleRow.typeof_body === 'blob') {
      sc.setBinaryBody(scribbleRow.body as Uint8Array);
    } else {
      sc.setTextBody(scribbleRow.body as string);
    }
    sc.setId(scribbleRow.id);
    setScribblePropsFromJSON(scribbleRow.props, sc.getPropsMap());
    return sc;
  }

  async getAllMetadata(): Promise<pb.Scribble[]> {
    const scribbles: pb.Scribble[] = [];
    await this.db!.each(
      SQL`SELECT id, props FROM Scribbles`,
      (err: Error, row: { id: string, props: string }) => {
        if (err) {
          throw err;
        }
        
        const sc = new pb.Scribble();
        sc.setId(row.id);
        setScribblePropsFromJSON(row.props, sc.getPropsMap());
        scribbles.push(sc);
      });

    return scribbles;
  }

  async setScribble(sc: pb.Scribble): Promise<void> {
    const propsObject: {[key: string]: string} = {};
    sc.getPropsMap().forEach((v: string, k: string) => {
      propsObject[k] = v;
    });
    const propsJson = JSON.stringify(propsObject);
    const body = sc.hasBinaryBody() ? sc.getBinaryBody_asU8() : sc.getTextBody();

    await this.db!.run(
      SQL`INSERT INTO Scribbles(id, body, props) VALUES (${sc.getId()}, ${body}, ${propsJson}) 
          ON CONFLICT (id) DO UPDATE
          SET body = excluded.body, props = excluded.props`);
  }

  async removeScribble(id: string): Promise<void> {
    await this.db!.exec(SQL`DELETE FROM Scribble WHERE id = ${id}`);
  }

  async getScribblesByTextSearch(query: string): Promise<pb.GetScribblesByTextSearchReply.SearchResult[]> {
    const results: pb.GetScribblesByTextSearchReply.SearchResult[] = [];
    await this.db!.each(
      SQL`SELECT id, snippet(ScribblesFTS, 0, "\001\002", "\002\001", "...", 10) AS snippet FROM ScribblesFTS WHERE body MATCH ${query} AND typeof(body) = "text"`,
      (err: Error, row: { id: string, snippet: string }) => {
        if (err) {
          throw err;
        }

        const r = new pb.GetScribblesByTextSearchReply.SearchResult();
        r.setId(row.id);
        r.setSnippet(row.snippet);
        results.push(r);
      });

    return results;
  }
}
