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

import { argv } from 'process';
import fs from 'fs';

const args = argv.slice(2);

const src = args[0];
const dst = args[1];

function processScribble(sourceFile: string, source: string): string {
  const lines = source.split('\n');

  // skip the license header
  while (lines[0].startsWith('//')) {
    lines.shift();
  }
  lines.shift();

  // check the magic
  if (lines.shift() !== '/* attributes *') {
    throw Error('magic not found');
  }

  const attrs = {} as { [key: string]: string };
  while (lines.length > 0) {
    const l = lines.shift()!;
    if (l === ' */') {
      break;
    }

    const groups = l.match(/ \*\s+([^:]+)\s*:\s*(.*)/);
    if (!groups) {
      throw Error(`cannot parse attibute from "${l}"`);
    }
    const [_, k, v] = groups;
    attrs[k] = v;
  }
  if (!attrs.id) {
    throw Error('id not present in attributes');
  }
  if (!attrs['content-type']) {
    throw Error('content-type not present in attributes');
  }
  const { id } = attrs;
  delete attrs.id;

  let body = lines.join('\n').trim();

  body += `\n//# sourceURL=${sourceFile}`;

  let output = '';
  output += `export default {\n`;
  output += `  id: '${id}',\n`;
  output += `  status: 'core',\n`;
  output += `  attributes: ${JSON.stringify(attrs)},\n`;
  output += `  body: ${JSON.stringify(body)},\n`;
  output += `} as { id: string, status: 'core', attributes: unknown, body: string };\n`;

  return output;
}

const i = fs.readFileSync(src, { encoding: 'utf8' });
const o = processScribble(src, i);
if (dst === '-') {
  process.stdout.write(o);
} else {
  fs.writeFileSync(dst, o, { encoding: 'utf8' });
}
