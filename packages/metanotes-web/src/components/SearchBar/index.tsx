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

import React, { useState } from 'react';

import { Container, TextField } from '@material-ui/core';

import useStyles from './styles';
import { DebounceInput } from 'react-debounce-input';
import { useSelector } from 'react-redux';
import { RootState, selectSheetsByFilter, SheetDocument } from '@metanotes/store';
import Sheet from '../Sheet';


function SearchBar() {
  const classes = useStyles();

  const [filter, setFilter] = useState('');

  const onSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilter(e.target.value);
  };

  // TODO: the  filter might actually return anything. we need filter typechescking
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  const sheets = useSelector((state: RootState) => selectSheetsByFilter(state, filter)) as SheetDocument[];

  let results;
  if (sheets && sheets.length > 0) {
    // TODO: what if there's no title, though? map to ID.
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const doc = sheets.map(sh => `* [[${sh.title!}]]`).join('\n');
    results = <Sheet sheet={{ _id: '@@meta-search-results', _data: doc }} className={classes.results} />;
  }

  return <Container maxWidth="md" className={classes.searchContainer}>
    <DebounceInput
      element={TextField}
      minLength={2}
      debounceTimeout={300}
      onChange={onSearchChange}
      variant="outlined"
      className={classes.input}
    />
    {results}
  </Container>;
}

export default React.memo(SearchBar);
