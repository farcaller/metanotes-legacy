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

import React from 'react';
import { useSelector } from 'react-redux';

import { RootState, selectSheetByTitle, selectSheetById } from '@metanotes/store';
import Markdown from '../Markdown';
import Image from './Image';

function Include({ title, id }: { title?: string; id?: string }): JSX.Element {
  const sheet = useSelector((state: RootState) => title ? selectSheetByTitle(state, title) : selectSheetById(state, id ? id : ''));

  if (!title && !id) {
    return <Markdown id={'XXX_ERR_XXX'} doc={`neither \`id\` nor \`title\` are specified for include`} inline={true} />;
  }

  if (sheet && sheet._data) {
    switch (sheet['content-type']) {
      case 'image/jpeg':
        return <Image url={`data:image/png;base64, ${sheet._data}`} title={sheet.title} alt={sheet.alt} />;
      default:
        return <Markdown id={sheet._id} doc={sheet._data} inline={true} />;
    }
  } else {
    // XXX: verified above
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return <Markdown id={'XXX_ERR_XXX'} doc={`NOT FOUND: \`${title ? title : id!}\``} inline={true} />;
  }
};

export default React.memo(Include);
