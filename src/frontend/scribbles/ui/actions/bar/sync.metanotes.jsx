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

/* attributes *
 * id: 01EV1AYKD24F4H4MWZ5VZPP6GT
 * content-type: application/vnd.metanotes.component-jsmodule
 * title: $:core/ui/actions/bar/sync
 * tags: ['$:core/ui/actions-bar']
 */

const { useCallback, useMemo } = React;
const { useDispatch, createSelector, useSelector, selectAllScribbles, equals, syncScribble, resetSyncError, selectLastSyncError } = core;
const { Icon, IconButton, makeStyles } = components;


const useStyles = makeStyles({
  dirty: {
    color: '#ff9800',
  },
  error: {
    color: 'red',
  }
});

const selectDirtyScribbles = createSelector(
  selectAllScribbles,
  (scribbles) => scribbles.filter(s => s.dirty === true),
);

function SyncAction({ id }) {
  const dispatch = useDispatch();
  const classes = useStyles();

  const dirtyScribbles = useSelector(state => selectDirtyScribbles(state), equals);
  const isDirty = useMemo(() => dirtyScribbles.length > 0, [dirtyScribbles]);
  const lastSyncFailed = useSelector(state => selectLastSyncError(state) !== null);

  const onSync = useCallback(() => {
    dispatch(resetSyncError());
    for (const s of dirtyScribbles) {
      dispatch(syncScribble(s));
    }
  }, [dispatch, dirtyScribbles]);

  return (
    <IconButton color={(isDirty || lastSyncFailed) ? "secondary" : "primary"} classes={{ colorSecondary: lastSyncFailed ? classes.error : isDirty ? classes.dirty : ''}} aria-label="sync to server" onClick={onSync}>
      <Icon>sync</Icon>
    </IconButton>
  )
}

export default React.memo(SyncAction);
