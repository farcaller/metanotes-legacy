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

import React, { useEffect } from 'react';

import { Container } from '@material-ui/core';
import { useHistory, useLocation } from 'react-router-dom';
import { useSelector, useStore } from 'react-redux';

import Sheet from '../Sheet';
import WikiLinkingContext from '../Markdown/WikiLinkingContext';
import useStyles from './styles';
import { RootState, selectSheetByTitle, selectSheetsByIDs } from '@metanotes/store';
import SearchBar from '../SearchBar';
import Actions from '../Actions';


function Spread({ ids }: { ids: string }) {
  const classes = useStyles();
  const history = useHistory();
  const store = useStore();

  // const { ids } = useParams() as { ids: string; };
  const loc = useLocation();
  // TODO: replace by url safe `-`
  const idsList = ids.split(',');
  const sheets = useSelector((state: RootState) => selectSheetsByIDs(state, idsList));
  const sheetRefs = sheets.reduce((acc, sh) => {
    acc[sh._id] = React.createRef();
    return acc;
  }, {} as {[key: string]: React.RefObject<HTMLElement>});
  const sheetElements = sheets.map(sh => <Sheet key={sh._id} sheet={sh} ref={sheetRefs[sh._id]} />);

  const onNavigateLink = (target: string) => {
    const state = store.getState() as RootState;
    const targetSheet = selectSheetByTitle(state, target);

    if (!targetSheet) {
      // TODO: what if nothing was found?
      return;
    }

    let path = `/spread/${idsList.join(',')}`;
    if (!idsList.includes(targetSheet._id)) {
      path += `,${targetSheet._id}`;
    }
    path += `#${targetSheet._id}`;
    history.push(path);
  };

  useEffect(() => {
    if (loc.hash.length === 0) { return; }
    const id = loc.hash.slice(1);
    const ref = sheetRefs[id];
    if (!ref || !ref.current) {
      console.warn(`tried to scroll to non-existent sheet ${id}:`, ref);
      return;
    }
    ref.current.scrollIntoView();
  }, [loc, sheetRefs]);

  return (
    <WikiLinkingContext.Provider value={onNavigateLink}>
      <SearchBar />

      <Container maxWidth="md" className={classes.root}>
        {sheetElements}
      </Container>

      <Actions />
    </WikiLinkingContext.Provider>
  );
}

Spread.whyDidYouRender = true;

export default React.memo(Spread);
