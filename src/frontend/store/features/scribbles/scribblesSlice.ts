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

/* eslint-disable @typescript-eslint/no-use-before-define */

import {
  createAsyncThunk, createEntityAdapter, createSlice, EntityState, PayloadAction,
} from '@reduxjs/toolkit';

// eslint-disable-next-line import/no-cycle
import { RootState } from '../..';
import { StorageAPI } from '../../client';
import { Attributes, recomputeAttributes, Scribble, ScribbleID } from './scribble';

export interface ScribblesState {
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  lastSyncError: string | null;
  titleToIdMap: {[key: string]: string[]};
  scribbles: EntityState<Scribble>;
}

export const scribblesAdapter = createEntityAdapter<Scribble>({
  selectId: (scribble) => scribble.id,
  sortComparer: (a, b) => a.id.localeCompare(b.id),
});

const initialState: ScribblesState = {
  status: 'idle',
  error: null,
  lastSyncError: null,
  titleToIdMap: {},
  scribbles: scribblesAdapter.getInitialState(),
};

export const fetchStoreMetadata = createAsyncThunk<Scribble[], void, {extra: StorageAPI}>(
  'scribbles/fetchStoreMetadata',
  async (_, { extra }) => extra.getAllMetadata(),
);

export const fetchScribble = createAsyncThunk<Scribble, Scribble, { extra: StorageAPI }>(
  'scribbles/fetchScribble',
  async (payload, { extra }) => extra.getScribble(payload.id),
);

export const syncScribble = createAsyncThunk<Scribble, Scribble, { extra: StorageAPI }>(
  'scribbles/syncScribble',
  async (payload, { extra }) => {
    await extra.setScribble(payload);
    return payload;
  },
);

export function resyncTitleToIdMap(state: ScribblesState): void {
  const m: { [key: string]: string[] } = {};
  const scribbles = selectAllScribbles({ scribbles: state });

  for (const scribble of scribbles) {
    const { title } = scribble.attributes;
    // eslint-disable-next-line no-continue
    if (!title) { continue; }
    // draft scribbles don't participate
    // eslint-disable-next-line no-continue
    if (scribble.attributes['mn-draft-of'] !== undefined || scribble.attributes['mn-draft-of'] === '') { continue; }

    if (!m[title]) {
      m[title] = [];
    }

    m[title].push(scribble.id);
  }
  state.titleToIdMap = m;
}

const scribblesSlice = createSlice({
  name: 'scribbles',
  initialState,
  reducers: {
    setCoreScribbles(state, action: PayloadAction<Scribble[]>) {
      const scribbles = action.payload;
      for (const s of scribbles) {
        s.computedAttributes = recomputeAttributes(s);
      }
      scribblesAdapter.upsertMany(state.scribbles, action.payload);
      resyncTitleToIdMap(state);
    },
    createDraft(state, action: PayloadAction<{ id: ScribbleID, newId: ScribbleID }>) {
      // TODO: update title map?
      const { id, newId } = action.payload;
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const oldScribble = selectScribbleById({ scribbles: state }, id)!;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const newScribble = JSON.parse(JSON.stringify(oldScribble)) as Scribble;
      newScribble.id = newId;
      if (oldScribble.status === 'core') {
        // if the old scribble is core, don't set the relation and create a new draft instead
        newScribble.attributes['mn-draft-of'] = '';
      } else {
        newScribble.attributes['mn-draft-of'] = id;
      }
      newScribble.status = 'synced';
      newScribble.computedAttributes = recomputeAttributes(newScribble);
      newScribble.dirty = true;
      scribblesAdapter.addOne(state.scribbles, newScribble);
    },
    createDraftScribble(state, action: PayloadAction<Scribble>) {
      // TODO: update title map
      // TODO: this doesn't create a "draft" per se. The API needs to be revisited and the surface reduced.
      const scribble = action.payload;
      scribble.computedAttributes = recomputeAttributes(scribble);
      scribble.dirty = true;
      scribblesAdapter.addOne(state.scribbles, scribble);
    },
    updateScribbleBody(state, action: PayloadAction<{ id: ScribbleID, body: string }>) {
      // TODO: binary body
      const { id, body } = action.payload;
      scribblesAdapter.updateOne(state.scribbles, {
        id,
        changes: {
          body,
          dirty: true,
        },
      });
    },
    updateScribbleAttributes(state, action: PayloadAction<{ id: ScribbleID, attributes: Partial<Attributes> }>) {
      // TODO: update title map
      const { id, attributes } = action.payload;
      const scribble = selectScribbleById({ scribbles: state }, id)!;
      const newScribble = JSON.parse(JSON.stringify(scribble)) as Scribble;
      newScribble.attributes = {
        ...newScribble.attributes,
        ...attributes,
      };
      const changes = {
        attributes: {
          ...scribble.attributes,
          ...attributes,
        },
        computedAttributes: recomputeAttributes(newScribble),
        dirty: true,
      };
      scribblesAdapter.updateOne(state.scribbles, {
        id,
        changes,
      });
    },
    removeScribbleAttributes(state, action: PayloadAction<{ id: ScribbleID, attributes: string[] }>) {
      // TODO: update title map
      const { id, attributes } = action.payload;
      const scribble = selectScribbleById({ scribbles: state }, id)!;
      const newScribble = JSON.parse(JSON.stringify(scribble)) as Scribble;
      for (const a of attributes) {
        delete newScribble.attributes[a];
      }

      const changes = {
        attributes: newScribble.attributes,
        computedAttributes: recomputeAttributes(newScribble),
        dirty: true,
      };
      scribblesAdapter.updateOne(state.scribbles, {
        id,
        changes,
      });
    },
    removeScribble(state, action: PayloadAction<ScribbleID>) {
      // TODO: update title map
      // TODO: dirty it how, exactly?..
      const scribble = selectScribbleById({ scribbles: state }, action.payload)!;
      if (scribble.binaryBodyURL) {
        URL.revokeObjectURL(scribble.binaryBodyURL);
      }
      scribblesAdapter.removeOne(state.scribbles, action.payload);
      resyncTitleToIdMap(state);
    },
    commitDraft(state, action: PayloadAction<ScribbleID>) {
      // TODO: update title map
      const draftScribble = selectScribbleById({ scribbles: state }, action.payload)!;
      const originalScribbleId = draftScribble.attributes['mn-draft-of']!;
      const draftScribbleId = draftScribble.id;

      if (originalScribbleId === '') {
        delete draftScribble.attributes['mn-draft-of'];
        scribblesAdapter.updateOne(state.scribbles, {
          id: originalScribbleId,
          changes: draftScribble,
        });
      } else {
        const newScribble = JSON.parse(JSON.stringify(draftScribble)) as Scribble;
        newScribble.id = originalScribbleId;
        newScribble.dirty = true;
        delete newScribble.attributes['mn-draft-of'];

        scribblesAdapter.updateOne(state.scribbles, {
          id: originalScribbleId,
          changes: newScribble,
        });
        scribblesAdapter.removeOne(state.scribbles, draftScribbleId);
      }
      resyncTitleToIdMap(state);
    },
    resetSyncError(state) {
      state.lastSyncError = null;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchStoreMetadata.pending, (state) => {
      state.status = 'loading';
    });
    builder.addCase(fetchStoreMetadata.fulfilled, (state, action) => {
      state.status = 'succeeded';
      state.error = null;
      scribblesAdapter.upsertMany(state.scribbles, action.payload);
      resyncTitleToIdMap(state);
    });
    builder.addCase(fetchStoreMetadata.rejected, (state, action) => {
      state.status = 'failed';
      state.error = action.error.message ? action.error.message : null;
    });

    builder.addCase(fetchScribble.pending, (state, action) => {
      scribblesAdapter.updateOne(state.scribbles, {
        id: action.meta.arg.id,
        changes: { status: 'pullingBody' },
      });
    });
    builder.addCase(fetchScribble.fulfilled, (state, action) => {
      scribblesAdapter.updateOne(state.scribbles, {
        id: action.meta.arg.id,
        changes: {
          ...action.payload,
          status: 'synced',
          error: undefined,
        },
      });
      resyncTitleToIdMap(state);
    });
    builder.addCase(fetchScribble.rejected, (state, action) => {
      scribblesAdapter.updateOne(state.scribbles, {
        id: action.meta.arg.id,
        changes: {
          status: 'failed',
          error: action.error.message,
        },
      });
    });

    builder.addCase(syncScribble.pending, (_state, _action) => {
      // TODO: do something?
    });
    builder.addCase(syncScribble.fulfilled, (state, action) => {
      scribblesAdapter.updateOne(state.scribbles, {
        id: action.meta.arg.id,
        changes: {
          status: 'synced',
          error: undefined,
          dirty: false,
        },
      });
    });
    builder.addCase(syncScribble.rejected, (state, action) => {
      state.lastSyncError = action.error.message || `failed to sync ${action.meta.arg.id}`;
      scribblesAdapter.updateOne(state.scribbles, {
        id: action.meta.arg.id,
        changes: {
          // TODO: weird state
          status: 'synced',
          error: action.error.message,
        },
      });
    });
  },
});

export default scribblesSlice.reducer;

export const {
  setCoreScribbles,
  createDraft,
  updateScribbleBody,
  updateScribbleAttributes,
  removeScribbleAttributes,
  removeScribble,
  commitDraft,
  createDraftScribble,
  resetSyncError,
} = scribblesSlice.actions;

export const {
  selectAll: selectAllScribbles,
  selectById: selectScribbleById,
  selectIds: selectScribbleIds,
} = scribblesAdapter.getSelectors((state: RootState) => state.scribbles.scribbles);
