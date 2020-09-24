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

import express from 'express';
import jmespath from 'jmespath';
import metadataParser from 'markdown-yaml-metadata-parser';

import path from 'path';
import util from 'util';
import fs from 'fs';
import process from 'process';


const readDir = util.promisify(fs.readdir);
const readFile = util.promisify(fs.readFile);

const app = express();
const port = 8080;

const readAll = async (): Promise<unknown[]> => {
  const dataPath = path.join(process.cwd(), 'data');
  try {
    const notes = [];
    const names = await readDir(dataPath);

    for (const fullName of names) {
      const { name, ext } = path.parse(fullName);
      switch (ext) {
        case '.md':
          {
            const data = await readFile(path.join(dataPath, fullName), {encoding: 'utf8'});
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call
            const parsed = metadataParser(data) as { metadata: {[key: string]: unknown}, content: string };
            notes.push({
              '_id': name,
              '_data': parsed.content,
              ...parsed.metadata
            });
          }
        break;
        case '.meta':
          {
            const content = await readFile(path.join(dataPath, `${name}.data`));

            const data = await readFile(path.join(dataPath, fullName), { encoding: 'utf8' });
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call
            const parsed = metadataParser(data) as { metadata: { [key: string]: unknown }, content: string };
            notes.push({
              '_id': name,
              '_data': content.toString('base64'),
              ...parsed.metadata
            });
          }
          break;
        case '.data':
          // skip
          break;
        default:
          console.error(`unknown file in the store: ${fullName}`);
      }
    }
    return notes;
  } catch (err) {
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    console.error(`failed to read data dir: ${err}`);
    return [];
  }
};

void readAll();

app.get("/", async (_req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify(await readAll()));
});

app.get("/query", async (req, res) => {
  const all = await readAll();
  res.setHeader('Content-Type', 'application/json');
  try {
    console.log(`parsing with ${req.query.q as string}`);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const filtered = jmespath.search(all, req.query.q as string);
    res.send(JSON.stringify(filtered));
  } catch(err) {
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    console.error(`failed to filter: ${err}`);
  }
});

app.post("/query", async (req, res) => {
  const all = await readAll();
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  try {
    console.log(`parsing with ${req.query.q as string}`);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const filtered = jmespath.search(all, req.query.q as string);
    res.send(JSON.stringify(filtered));
  } catch (err) {
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    console.error(`failed to filter: ${err}`);
  }
});

app.post("/all", async (_req, res) => {
  const all = await readAll();
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.send(JSON.stringify(all));
});

// start the Express server
app.listen(port, () => {
  console.log(`server started at http://localhost:${port}`);
});
