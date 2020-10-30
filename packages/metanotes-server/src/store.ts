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

import metadataParser from 'markdown-yaml-metadata-parser';
import util from 'util';
import fs from 'fs';
import path from 'path';
import { safeDump } from 'js-yaml';


const readDir = util.promisify(fs.readdir);
const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);
const unlink = util.promisify(fs.unlink);

interface Scribble {
  id: string;
  body?: string;
  attributes: Map<string, string>;
}

function parseMarkdown(data: string): {
  body: string;
  attributes: Map<string, string>;
} {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  const parsed = metadataParser(data) as { metadata: { [key: string]: unknown }, content: string };
  const attrs = new Map<string, string>();
  for (const k of Object.keys(parsed.metadata)) {
    attrs.set(k, JSON.stringify(parsed.metadata[k]));
  }
  return {
    body: parsed.content,
    attributes: attrs,
  };
}

export class Store {
  constructor(private readonly basePath: string) {}

  async getScribble(id: string): Promise<Scribble> {
    const filename = `${id}.md`;
    try {
      const data = await readFile(path.join(this.basePath, filename), { encoding: 'utf8' });
      const { body, attributes } = parseMarkdown(data);
      if (!attributes.has('content-type')) {
        attributes.set('content-type', '"text/markdown"');
      }
      return {
        id,
        body,
        attributes,
      };
    } catch (e) {
      const meta = await readFile(path.join(this.basePath, `${id}.meta`), { encoding: 'utf8' });
      const data = await readFile(path.join(this.basePath, `${id}.data`));
      const attributes = parseMarkdown(meta).attributes;

      return {
        id,
        attributes,
        body: data.toString('base64'),
      };
    }
  }

  async getAllMetadata(): Promise<Scribble[]> {
    const scribs = [];
    const names = await readDir(this.basePath);

    for (const fullName of names) {
      const { name, ext } = path.parse(fullName);
      switch (ext) {
        case '.md':
          {
            const data = await readFile(path.join(this.basePath, fullName), { encoding: 'utf8' });
            const { attributes } = parseMarkdown(data);
            if (!attributes.has('content-type')) {
              attributes.set('content-type', '"text/markdown"');
            }
            scribs.push({
              id: name,
              attributes,
            });
          }
          break;
        case '.meta':
          {
            // const content = await readFile(path.join(this.basePath, `${name}.data`));

            const data = await readFile(path.join(this.basePath, fullName), { encoding: 'utf8' });
            const { attributes } = parseMarkdown(data);
            scribs.push({
              id: name,
              attributes,
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
    return scribs;
  }

  async setScribble(sc: Scribble): Promise<void> {
    const attrs: {[key: string]: never} = {};
    sc.attributes.forEach((v, k) => {
      attrs[k] = JSON.parse(v) as never;
    }); 
    if (sc.attributes.get('content-type').startsWith('text/')) {
      let frontmatter;
      if (Object.keys(attrs).length === 0) {
        frontmatter = '---\n---\n';
      } else {
        frontmatter = '---\n' + safeDump(attrs).trim() + '\n---\n';
      }
      const doc = frontmatter + sc.body;
      await writeFile(path.join(this.basePath, `${sc.id}.md`), doc);
    } else {
      const frontmatter = '---\n' + safeDump(attrs).trim() + '\n---\n';
      const binaryData = Buffer.from(sc.body, 'base64');
      await writeFile(path.join(this.basePath, `${sc.id}.meta`), frontmatter);
      await writeFile(path.join(this.basePath, `${sc.id}.data`), binaryData);
    }
  }

  async removeScribble(id: string): Promise<void> {
    const filePath = path.join(this.basePath, `${id}.md`);
    if (fs.existsSync(filePath)) {
      await unlink(filePath);
    } else {
      const dataPath = path.join(this.basePath, `${id}.data`);
      const metaPath = path.join(this.basePath, `${id}.meta`);
      await Promise.all([unlink(dataPath), unlink(metaPath)]);
    }
  }
}
