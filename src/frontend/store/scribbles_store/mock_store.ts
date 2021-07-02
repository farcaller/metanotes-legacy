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

import coreScribbles from '../../scribbles';
import ScribbleStore from './scribbles_store';
import { StorageAPI } from '../client';

function MockStore(): ScribbleStore {
  const mockStore = new ScribbleStore(undefined as unknown as StorageAPI);
  mockStore.loadCoreScribbles(coreScribbles);

  autorun(() => {
    for (const scribble of Object.values(mockStore.scribbles)) {
      const _ = scribble.JSModule;
      scribble.latestStableVersion?.getMeta('parser');
    }
  });

  return mockStore;
}

export default MockStore;
