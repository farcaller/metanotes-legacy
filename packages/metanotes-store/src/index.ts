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

import { configureStore, getDefaultMiddleware, combineReducers, AnyAction } from '@reduxjs/toolkit';
import { useSelector, TypedUseSelectorHook } from 'react-redux';

import { StorageAPI } from './api';
import scribblesReducer, { ScribblesState as _ScribblesState } from './features/scribbles/scribblesSlice';

const rootReducer = combineReducers({
  scribbles: scribblesReducer,
});
export type RootState = ReturnType<typeof rootReducer>;

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
export const useTypedSelector: TypedUseSelectorHook<RootState> = useSelector;

const logger = (store: { getState: () => unknown; }) => (next: (arg0: AnyAction) => unknown) => (action: AnyAction) => {
  console.log('dispatching', action);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const result = next(action);
  console.log('next state', store.getState());
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return result;
};

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
const store = (preloadedState: RootState | undefined, api: StorageAPI) => configureStore({
  reducer: rootReducer,
  preloadedState,
  middleware: getDefaultMiddleware({
    thunk: {
      extraArgument: api,
    }
  }),
});

export default store;
