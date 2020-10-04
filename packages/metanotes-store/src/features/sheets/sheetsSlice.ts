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

import { createAsyncThunk, createEntityAdapter, createSelector, createSlice } from '@reduxjs/toolkit';

import run from '@metanotes/filter';
import { RootState } from '../../';
import { BackendAPI } from '../../api';


export interface SheetDocument {
  _id: string;
  _data?: string;

  title?: string;

  [x: string]: string | undefined;
}

export interface SheetsState {
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}


const sheetsAdapter = createEntityAdapter({
  selectId: (sheet: SheetDocument) => sheet._id,
  sortComparer: (a, b) => a._id.localeCompare(b._id),
});

const initialState = sheetsAdapter.getInitialState({
  status: 'idle',
  error: null,
} as SheetsState);

export type SheetsSliceType = typeof initialState;

export const fetchSheets = createAsyncThunk<SheetDocument[], void, {extra: BackendAPI}>('sheets/fetchSheets', async (_, { extra }) => {
  return await extra.getAllSheets();
});

const sheetsSlice = createSlice({
  name: 'sheets',
  initialState,
  reducers: {
    setSheet: (store, action): void => {
      // TODO: this must accept the default params
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const { id, data } = action.payload;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      const sh = store.entities[id];
      if (sh) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        sh._data = data;
      } else {
        // TODO: what are we updating again?
      }
    }
  },
  extraReducers: builder => {
    builder.addCase(fetchSheets.pending, (state) => {
      state.status = 'loading';
    });
    builder.addCase(fetchSheets.fulfilled, (state, action) => {
      state.status = 'succeeded';
      state.error = null;
      sheetsAdapter.upsertMany(state, action.payload);
    });
    builder.addCase(fetchSheets.rejected, (state, action) => {
      state.status = 'failed';
      state.error = action.error.message ? action.error.message : null;
    });
  },
});

export const { setSheet } = sheetsSlice.actions;

export const {
  selectAll: selectAllSheets,
  selectById: selectSheetById,
  selectIds: selectSheetIds
} = sheetsAdapter.getSelectors((state: RootState) => state.sheets);

export const selectSheetByTitle = createSelector(
  [selectAllSheets, (_state: RootState, title: string): string => title],
  (sheets, title) => sheets.find(sh => sh.title === title)
);

export const selectSheetsByFilter = createSelector(
  [selectAllSheets, (_state: RootState, filter: string): string => filter],
  (sheets, filter) => {
    if (!filter || filter.length === 0) { return []; }
    // TODO: filters are unsafe
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return run(filter, sheets);
  },
);

export const selectSheetsByIDs = (state: RootState, ids: string[]): SheetDocument[] =>
  ids.map(id => state.sheets.entities[id]).filter(Boolean) as SheetDocument[];

export default sheetsSlice.reducer;
