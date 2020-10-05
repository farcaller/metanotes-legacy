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

import React, { useCallback, useState } from 'react';

import { Paper } from '@material-ui/core';
import { useDispatch } from 'react-redux';

import { setSheet, SheetDocument } from '@metanotes/store';
import useStyles from './styles';
import ViewSheet from './ViewSheet';
import { EditSheet } from './EditSheet';


interface SheetProps {
  sheet: SheetDocument;
  [x: string]: unknown;
}

const Sheet = React.forwardRef(({ sheet, ...props }: SheetProps, ref) => {
  const [editing, setEditing] = useState(false);

  const classes = useStyles();
  const dispatch = useDispatch();

  const onEdit = useCallback(() => {
    setEditing(true);
  }, []);

  const onSave = (data: string) => {
    dispatch(setSheet({id: sheet._id, data}));
    setEditing(false);
  };

  const onCancelEditing = () => {
    setEditing(false);
  };

  return (
    <Paper ref={ref} className={classes.sheet} {...props}>
      {editing ? <EditSheet sheet={sheet} onSave={onSave} onClose={onCancelEditing} /> : <ViewSheet sheet={sheet} onEdit={onEdit} />}
    </Paper>
  );
});

// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-explicit-any
(Sheet as any).whyDidYouRender = true;

export default React.memo(Sheet);
