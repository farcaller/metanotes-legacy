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

/* eslint-disable @typescript-eslint/camelcase */

import { Octokit } from '@octokit/rest';
import { createTokenAuth } from "@octokit/auth-token";
import { Buffer } from 'buffer';
import metadataParser from 'markdown-yaml-metadata-parser';
import { safeDump } from 'js-yaml';

import { SheetDocument } from '../features/sheets/sheetsSlice';


export interface GithubConfig {
  owner: string;
  repo: string;
  ref: string;
  token?: string;
}

interface SheetInfo {
  path: string;
  sha: string;
}

// TODO: find a better place for this
function prepareSheetContent(sheet: SheetDocument): string {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const md = {} as any;
  let text = '';
  for (const k of Object.keys(sheet)) {
    switch (k) {
      case '_id':
        continue;
      case '_data':
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        text = sheet._data!;
        break;
      default:
        md[k] = sheet[k];
    }
  }
  const frontmatter = '---\n' + safeDump(md).trim() + '\n---\n';
  const data = frontmatter + text;
  return Buffer.from(data).toString('base64');
}


export class GithubAPI {
  private octokit?: Octokit;

  private readonly owner: string;
  private readonly repo: string;
  private readonly ref: string;
  private readonly token: string;

  private readonly repoMetadata: { owner:string, repo: string };
  private sheets: SheetInfo[];

  constructor(config: GithubConfig) {
    this.owner = config.owner;
    this.repo = config.repo;
    this.ref = config.ref || 'heads/main';
    this.token = config.token!;
    console.log(config);
    this.repoMetadata = { owner: this.owner, repo: this.repo };

    this.sheets = [];
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  private async auth() {
    if (this.octokit !== undefined) {
      console.log('ok defined');
      return;
    }

    // const auth = createTokenAuth(this.token);
    // console.log('need auth', auth);
    // // const authentication = await auth();
    // console.log('authed', authentication);

    this.octokit = new Octokit({
      // auth: authentication,
      auth: `token ${this.token}`,
    });
  }

  private async updateSheets(force = false) {
    if (this.sheets.length > 0 && force === false) { return; }

    await this.auth();
    const ok = this.octokit!;

    const ref = await ok.git.getRef({ ...this.repoMetadata, ref: this.ref });
    const headCommitSHA = ref.data.object.sha;
    const headCommit = await ok.git.getCommit({ ...this.repoMetadata, commit_sha: headCommitSHA });
    const treeSHA = headCommit.data.tree.sha;
    const tree = await ok.git.getTree({ ...this.repoMetadata, tree_sha: treeSHA });

    const sheetsTreeNode = tree.data.tree.find((e) => e.path === 'sheets');
    if (sheetsTreeNode === undefined) {
      throw Error(`sheets subtree not found in the repo at ${headCommitSHA}`);
    }

    const sheetsTree = await ok.git.getTree({ ...this.repoMetadata, tree_sha: sheetsTreeNode.sha });

    this.sheets = sheetsTree.data.tree.map(e => ({ path: e.path, sha: e.sha }));
  }

  async getAllSheets(): Promise<SheetDocument[]> {
    await this.auth();
    const ok = this.octokit!;

    await this.updateSheets();

    const sheets = [];
    for (const n of this.sheets) {
      // TODO: parallelize
      const blob = await ok.git.getBlob({ ...this.repoMetadata, file_sha: n.sha });

      if (n.path.endsWith('.md')) {
        const content = Buffer.from(blob.data.content, 'base64').toString('utf-8');

        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        const parsed = metadataParser(content) as { metadata: { [key: string]: unknown }, content: string };

        sheets.push({
          '_id': n.path.slice(0, -3),
          '_data': parsed.content,
          ...parsed.metadata
        });
      } else {
        throw Error(`TODO: unhandled data type for ${n.path}`);
      }
    }

    return sheets;
  }

  async upsertSheet(sheet: SheetDocument): Promise<SheetDocument> {
    await this.auth();
    const ok = this.octokit!;

    await this.updateSheets();

    const fn = `${sheet._id}.md`;

    await ok.repos.createOrUpdateFileContents({
      ...this.repoMetadata,
      path: `sheets/${fn}`,
      message: `update document ${sheet._id}`,
      content: prepareSheetContent(sheet),
      sha: this.sheets.find(e => e.path === fn)?.sha,
    });

    await this.updateSheets(true);

    return sheet;
  }
}
