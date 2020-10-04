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

import 'source-map-support/register';

import path from 'path';
import fs from 'fs';

import React from 'react';
import ReactDOMServer from 'react-dom/server';
import App from '../src/components/App';
import { Provider } from 'react-redux';
import { StaticRouter } from 'react-router-dom';
import { ServerStyleSheets, ThemeProvider } from '@material-ui/core';
import { nanoid } from '@reduxjs/toolkit';

import store, { createBackend, fetchSheets, SheetDocument } from '@metanotes/store';
import theme from '../src/theme';


declare const BUILD_DIR: string;
declare const INDEX_TEMPLATE: string;
declare const BACKEND_CONFIG: string;

const rootDiv = `<div id="root"></div>`;

const api = createBackend(BACKEND_CONFIG);

const theStore = store(undefined, api);

function Main({ loc }: { loc: string }) {
  const ctx = {};

  return (
    <React.StrictMode>
      <StaticRouter location={loc} context={ctx}>
        <ThemeProvider theme={theme}>
          <Provider store={theStore}>
            <App />
          </Provider>
        </ThemeProvider>
      </StaticRouter>
    </React.StrictMode>
  );
};

async function build() {
  const sheets = (await theStore.dispatch(fetchSheets())).payload as SheetDocument[];

  const preloadedState = theStore.getState();
  const stateId = nanoid();
  fs.writeFileSync(path.join(BUILD_DIR, `state-${stateId}.js`), `window.__PRELOADED_STATE__ = ${JSON.stringify(preloadedState).replace(/</g, '\\u003c')}`);

  const indexHtml = fs.readFileSync(INDEX_TEMPLATE, { encoding: 'utf-8' });

  fs.mkdirSync(path.join(BUILD_DIR, 'spread'));
  for(const sh of sheets) {
    const outDir = path.join(BUILD_DIR, 'spread', sh._id);
    fs.mkdirSync(outDir);

    const sheets = new ServerStyleSheets();

    const app = ReactDOMServer.renderToString(sheets.collect(
      <Main loc={`/spread/${sh._id}`} />
    ));

    const css = sheets.toString();

    const genIndex = (indexHtml
      .replace(rootDiv, `<div id="root">${app}</div>`)
      .replace('</head>', `<style id="jss-server-side">${css}</style></head>`)
      .replace('</head>', `<script src="/state-${stateId}.js"></script></head>`)
    );
    fs.writeFileSync(path.join(outDir, 'index.html'), genIndex);
  }
}

void build();
