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

import React, { useContext } from 'react';
import { useDispatch } from 'react-redux';
import equals from 'deep-equal';

import { useTypedSelector } from '../../index';
import { Scribble } from './scribble';
import { ScribbleResolverContext } from './ScribbleResolverContext';
import { selectScribbleByTitle } from './scribblesSlice';

type ComponentCache = { [key: string]: { scribble: Scribble, component: React.FunctionComponent<unknown> } };

export const UseScribbleContext = React.createContext(null as unknown as ComponentCache);

export function useScribble(title: string): React.FunctionComponent<unknown> {
  const dispatch = useDispatch();
  const cache = useContext(UseScribbleContext);
  const resolver = useContext(ScribbleResolverContext);
  const sc = useTypedSelector(state => selectScribbleByTitle(state, title));

  if (sc === undefined) {
    return resolver.resolver({ title }, dispatch, sc);
  }

  const cached = cache[sc.id];
  if (cached && equals(cached.scribble, sc, { strict: true })) {
    return cached.component;
  }

  const el = resolver.resolver({ title }, dispatch, sc);
  if (sc.status === 'core' || sc.status === 'synced') {
    cache[sc.id] = {
      scribble: sc,
      component: el,
    };
  }
  return el;
}