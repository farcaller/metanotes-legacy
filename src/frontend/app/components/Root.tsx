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

import React from 'react';

import CommonUIProvider from '../ui';
import Store from './Store';
import ScribblesContainer from './ScribblesContainer';
import SpreadStoreProvider from '../../store/spread_store/provider';
import Toolbar from './Toolbar';

function Root() {
  return (
    <Store>
      <CommonUIProvider>
        <SpreadStoreProvider>
          <ScribblesContainer />
          <Toolbar />
        </SpreadStoreProvider>
      </CommonUIProvider>
    </Store>
  );
}

export default Root;
