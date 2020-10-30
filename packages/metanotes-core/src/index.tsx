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

import './wdyr';

import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { Provider } from 'react-redux';

import store from '@metanotes/store';
import { createBackend } from '@metanotes/store/lib/api';
import scribbles from './scribblefs';
import { setCoreScribbles, UseScribbleContext } from '@metanotes/store/lib/features/scribbles';
import ScribbleResolver from './ScribbleResolver';

const api = createBackend({
  backend: 'metanotes-server',
  config: { hostname: 'http://127.0.0.1:55080' },
});
const theStore = store(undefined, api);

theStore.dispatch(setCoreScribbles(scribbles));

ReactDOM.render(
  <React.StrictMode>
    <Provider store={theStore}>
      <ScribbleResolver>
        <UseScribbleContext.Provider value={{}}>
          <App />
        </UseScribbleContext.Provider>
      </ScribbleResolver>
    </Provider>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
