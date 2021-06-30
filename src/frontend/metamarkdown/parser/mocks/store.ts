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
import useStore from '../../../store/context/use_context';

class ScribblesStore {
  readonly scribbles: Scribble[];

  constructor() {
    this.scribbles = coreScribbles.map((coreScribble) => Scribble.fromCoreScribble(this, coreScribble));
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

  toJSON(): unknown {
    return `<mockstore ${this.scribbles.length} scribbles>`;
  }

  // eslint-disable-next-line class-methods-use-this
  useStore = useStore;

  // eslint-disable-next-line class-methods-use-this
  renameScribble(_s: Scribble, _n: string) {
    throw Error('not implemented');
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
