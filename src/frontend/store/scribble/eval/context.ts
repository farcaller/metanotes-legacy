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

import { makeAutoObservable } from 'mobx';
import { computedFn } from 'mobx-utils';
import { createContext } from 'react';

export class EvalStore {
  private $values: Map<string, unknown> = new Map();

  private parentStore?: EvalStore;

  constructor(parent?: EvalStore) {
    makeAutoObservable(this);
    this.parentStore = parent;
  }

  get: (k: string) => unknown = computedFn((key: string) => {
    const val = this.$values.get(key);
    if (val) {
      return val;
    }
    if (this.parentStore) {
      return this.parentStore.get(key);
    }
    return '';
  })

  set(key: string, value: unknown) {
    this.$values.set(key, value);
  }
}

const EvalStoreContext = createContext<EvalStore | undefined>(undefined);

export default EvalStoreContext;
