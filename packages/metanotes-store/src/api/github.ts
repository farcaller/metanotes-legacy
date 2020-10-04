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

import { Octokit } from '@octokit/rest';
import { Buffer } from 'buffer';
import metadataParser from 'markdown-yaml-metadata-parser';

import { SheetDocument } from '../features/sheets/sheetsSlice';


export interface GithubConfig {
  owner: string;
  repo: string;
  ref: string;
}

export class GithubAPI {
  private readonly octokit: Octokit;

  private readonly owner: string;
  private readonly repo: string;
  private readonly ref: string;

  constructor(config: GithubConfig) {
    this.octokit = new Octokit();

    this.owner = config.owner;
    this.repo = config.repo;
    this.ref = config.ref || 'heads/main';
  }

  async getAllSheets(): Promise<SheetDocument[]> {
    const repo = { owner: this.owner, repo: this.repo };

    const ref = await this.octokit.git.getRef({ ...repo, ref: this.ref });
    const headCommitSHA = ref.data.object.sha;
    const headCommit = await this.octokit.git.getCommit({ ...repo, commit_sha: headCommitSHA });
    const treeSHA = headCommit.data.tree.sha;
    const tree = await this.octokit.git.getTree({ ...repo, tree_sha: treeSHA });

    const sheetsTreeNode = tree.data.tree.find((e) => e.path === 'sheets');
    if (sheetsTreeNode === undefined) {
      throw Error(`sheets subtree not found in the repo at ${headCommitSHA}`);
    }

    const sheetsTree = await this.octokit.git.getTree({ ...repo, tree_sha: sheetsTreeNode.sha });

    const sheets = [];
    for (const n of sheetsTree.data.tree) {
      // TODO: parallelize
      const blob = await this.octokit.git.getBlob({ ...repo, file_sha: n.sha });

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
}
