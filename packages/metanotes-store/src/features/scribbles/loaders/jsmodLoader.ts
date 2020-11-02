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

import React, { useState, useEffect } from 'react';
import { transform } from '@babel/standalone';
import { useDispatch, useSelector } from 'react-redux';
import equals from 'deep-equal';

import { SyncedScribble } from '../scribble';
import { fetchScribble, selectScribbleByTitle, selectScribbleById, selectAllScribbles } from '../scribblesSlice';
import { useScribble } from '../useScribble';


const coreLocals = {
  useState,
  useSelector,
  useEffect,
  useDispatch,
  selectScribbleById,
  selectScribbleByTitle,
  selectAllScribbles,
  useScribble,
  fetchScribble,
  equals,
};
const exportedLocals = { React, core: coreLocals };
const localKeys = Object.keys(exportedLocals) as (keyof typeof exportedLocals)[];
const localValues = localKeys.map(k => exportedLocals[k]);

export function loadJsModule(sc: SyncedScribble, components: { [key: string]: React.FunctionComponent<unknown> }): React.FunctionComponent<unknown> {
  console.log(`loading jsmodule for ${sc.attributes['title']} (${sc.id})`);
  const modBody = transform(sc.body, {
    presets: ['env', 'react']
  }).code;
  if (modBody === null || modBody === undefined) {
    throw Error('failed to transpile the body');
  }
  const exports = {} as { default: React.FunctionComponent<unknown> };
  // eslint-disable-next-line @typescript-eslint/no-implied-eval
  new Function('exports', 'components', ...localKeys, modBody)(exports, components, ...localValues);
  if (exports.default === undefined) {
    throw 'the modeule does not define a default export';
  }
  return exports.default;
}
