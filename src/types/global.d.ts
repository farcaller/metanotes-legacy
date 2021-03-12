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

declare const core: {
  createCachedSelector: typeof import('re-reselect').createCachedSelector,
  createSelector: typeof import('@reduxjs/toolkit').createSelector,
  useSelector: typeof import('react-redux').useSelector,
  useDispatch: typeof import('react-redux').useDispatch,
  selectScribbleById: typeof import('../frontend/store/features/scribbles/index').selectScribbleById,
  selectScribbleByTitle: typeof import('../frontend/store/features/scribbles/selectors').selectScribbleByTitle,
  selectScribblesByTag: typeof import('../frontend/store/features/scribbles/tagging').selectScribblesByTag,
  selectAllScribbles: typeof import('../frontend/store/features/scribbles/index').selectAllScribbles,
  useScribble: typeof import('../frontend/store/features/scribbles/useScribble').useScribble,
  fetchScribble: typeof import('../frontend/store/features/scribbles/index').fetchScribble,
  removeScribble: typeof import('../frontend/store/features/scribbles/index').removeScribble,
  updateScribbleBody: typeof import('../frontend/store/features/scribbles/index').updateScribbleBody,
  updateScribbleAttributes: typeof import('../frontend/store/features/scribbles/index').updateScribbleAttributes,
  removeScribbleAttributes: typeof import('../frontend/store/features/scribbles/index').removeScribbleAttributes,
  commitDraft: typeof import('../frontend/store/features/scribbles/index').commitDraft,
  equals: typeof import('deep-equal'),
  loadScribbleComponent: typeof import('../frontend/store/features/scribbles/useScribble').loadScribbleComponent,
  UseScribbleContext: typeof import('../frontend/store/features/scribbles/useScribble').UseScribbleContext,
  ScribbleResolverContext:
    typeof import('../frontend/store/features/scribbles/ScribbleResolverContext').ScribbleResolverContext,
  createDraftScribble: typeof import('../frontend/store/features/scribbles/index').createDraftScribble,
  ulid: typeof import('ulid'),
  syncScribble: typeof import('../frontend/store/features/scribbles/index').syncScribble,
  resetSyncError: typeof import('../frontend/store/features/scribbles/index').resetSyncError,
  selectLastSyncError: typeof import('../frontend/store/features/scribbles/index').selectLastSyncError,
};

declare const components: {
  PropTypes: typeof import('prop-types'),
  Parsimmon: typeof import('parsimmon'),
};
