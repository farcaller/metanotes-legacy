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

import React, { useContext, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import equals from 'deep-equal';
import { Action, Dispatch } from '@reduxjs/toolkit';

import { useTypedSelector } from '../../index';
import { Scribble } from './scribble';
import { ScribbleResolverContext, ScribbleResolverContextType } from './ScribbleResolverContext';
import { selectScribbleByTitle } from './selectors';

export type ComponentCache = { [key: string]: { scribble: Scribble, component: React.ComponentType } };

export const UseScribbleContext = React.createContext(null as unknown as ComponentCache);

export function loadScribbleComponent(
  resolver: ScribbleResolverContextType,
  dispatch: Dispatch<Action<unknown>>,
  cache: ComponentCache,
  title: string,
  scribble?: Scribble,
): React.ComponentType {
  if (scribble === undefined) {
    return resolver.resolver({ title }, dispatch, scribble);
  }

  const cached = cache[scribble.id];
  if (cached && equals(cached.scribble, scribble, { strict: true })) {
    return cached.component;
  }

  const el = resolver.resolver({ title }, dispatch, scribble);
  if (scribble.status === 'core' || scribble.status === 'synced') {
    cache[scribble.id] = {
      scribble,
      component: el,
    };
  }
  return el;
}

export function useScribble(title: string): React.ComponentType {
  const dispatch = useDispatch();
  const cache = useContext(UseScribbleContext);
  const resolver = useContext(ScribbleResolverContext);
  const sc = useTypedSelector((state) => selectScribbleByTitle(state, title), equals);

  return useMemo(
    () => loadScribbleComponent(resolver, dispatch, cache, title, sc),
    [resolver, dispatch, cache, title, sc],
  );
}
