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

/* eslint-disable jsdoc/require-jsdoc */

import { autorun } from 'mobx';

import coreScribbles from '../../../scribbles';
import Scribble from '../../../store/scribble/scribble';
import { ScribblesStore as ScribblesStoreInterface } from '../../../store/interface/store';

class ScribblesStore {
  readonly scribbles: Scribble[];

  constructor() {
    const resolvedScribbles = [];
    for (const coreScribble of coreScribbles) {
      if (coreScribble.meta['mn-title']?.startsWith('$:core/parser')) {
        const scribble = Scribble.fromCoreScribble(this as unknown as ScribblesStoreInterface, coreScribble);
        resolvedScribbles.push(scribble);
      }
    }
    this.scribbles = resolvedScribbles;
  }

  scribbleByTitle(title: string): Scribble | undefined {
    return this.scribbles.find((scribble) => scribble.title === title);
  }

  requireScribble<T>(title: string): T {
    const scribble = this.scribbleByTitle(title);
    if (!scribble) {
      throw Error(`failed to require scribble: '${title}': does not exist`);
    }
    return scribble.JSModule as T;
  }

  get parserScribbles(): Scribble[] {
    return this.scribbles.filter(
      (scribble) => scribble.latestStableVersion?.computedMeta.tags.includes('$:core/parser'),
    );
  }
}

const mockStore = new ScribblesStore();

autorun(() => {
  for (const scribble of Object.values(mockStore.parserScribbles)) {
    const _ = scribble.JSModule;
    scribble.latestStableVersion?.getMeta('parser');
  }
});

export default mockStore;
