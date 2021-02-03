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

import React, { createElement, useContext, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { CssBaseline, LinearProgress } from '@material-ui/core';
import equals from 'deep-equal';

import { useTypedSelector } from '../store';
import { fetchStoreMetadata, loadScribbleComponent, ScribbleResolverContext, selectScribbleByTitle, selectScribblesByTag, UseScribbleContext } from '../store/features/scribbles';
import { ErrorBoundary } from './ScribbleResolver';
import { Route, Switch } from 'react-router-dom';


function App(): JSX.Element {
  const preloaderStatus = useTypedSelector(state => state.scribbles.status);

  const dispatch = useDispatch();
  const routeScribbles = useTypedSelector(state => selectScribblesByTag(state, '$:core/routes'), equals);
  let rootEl = <LinearProgress />;

  const cache = useContext(UseScribbleContext);
  const resolver = useContext(ScribbleResolverContext);
  const routeScribbleElements = useTypedSelector(state => routeScribbles.map(rs => selectScribbleByTitle(state, rs.attributes['element'] as string)), equals);
  const routeScribbleRoutes = useMemo(() => routeScribbles.map((scribble, idx) => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const Comp = loadScribbleComponent(resolver, dispatch, cache, scribble.attributes.title!, routeScribbleElements[idx]);
    return (
      <Route exact={scribble.attributes['exact'] === 'true'} path={scribble.attributes['path']}>
        <Comp />
      </Route>
    );
  }), [resolver, dispatch, cache, routeScribbles, routeScribbleElements]);
  
  switch (preloaderStatus) {
    case 'idle':
      dispatch(fetchStoreMetadata());
      break;
    case 'succeeded':
      rootEl = createElement(Switch, null, ...routeScribbleRoutes);
      break;
    default:
      // TODO: what's the generic type for these?
  }

  return (
    <>
      <CssBaseline />
      <ErrorBoundary>
        {rootEl}
      </ErrorBoundary>
    </>
  );
}

export default React.memo(App);
