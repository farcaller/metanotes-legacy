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
import { useDispatch } from 'react-redux';
import { LinearProgress } from '@material-ui/core';

import { useTypedSelector } from '@metanotes/store';
import { useScribble, fetchStoreMetadata } from '@metanotes/store/lib/features/scribbles';
import { ErrorBoundary } from './ScribbleResolver';


function App(): JSX.Element {
  const preloaderStatus = useTypedSelector(state => state.scribbles.status);

  const dispatch = useDispatch();
  let RootEl = useScribble('$:core/app');

  switch (preloaderStatus) {
    case 'idle':
      dispatch(fetchStoreMetadata());
      RootEl = () => <div>loading app core</div>;
      break;
    case 'succeeded':
      break;
    default:
      // TODO: what's the generic type for these?
      RootEl = LinearProgress as unknown as React.FunctionComponent<unknown>;
  }

  return (
    <div className="App">
      <ErrorBoundary>
        <RootEl/>
      </ErrorBoundary>
    </div>
  );
}

export default React.memo(App);
