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

import { configureStore, getDefaultMiddleware } from '@reduxjs/toolkit';

import { BackendAPI } from './api';
import sheetsReducer, { SheetsSliceType } from './features/sheets/sheetsSlice';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const store = (preloadedState: { sheets: SheetsSliceType } | undefined, api: BackendAPI) => configureStore({
  reducer: {
    sheets: sheetsReducer,
  },
  preloadedState,
  middleware: getDefaultMiddleware({
    thunk: {
      extraArgument: api,
    }
  }),
});

export type RootState = { sheets: SheetsSliceType };

export default store;

export { selectAllSheets, fetchSheets, selectSheetByTitle, selectSheetById, setSheet, SheetDocument, selectSheetsByFilter, selectSheetsByIDs } from './features/sheets/sheetsSlice';

export { createBackend, BackendConfig } from './api';
