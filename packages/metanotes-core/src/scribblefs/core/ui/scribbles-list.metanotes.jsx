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
 * id: 01EP1TBVVNRJBJKB12XBYQ4A49
 * content-type: application/vnd.metanotes.component-jsmodule
 * title: $:core/ui/scribbles-list
 */

const { selectAllScribbles, useSelector, equals } = core;
const { List, ListItem, ListItemText, RouterLink, makeStyles } = components;

const useStyles = makeStyles({
  root: {
    overflowWrap: 'anywhere',
  },
});

function ScribblesList({ scribble }) {
  const classes = useStyles();
  const scribbles = useSelector(state => selectAllScribbles(state).map(s => ({ id: s.id, attributes: { title: s.attributes.title } })), equals);

  const scribbleItems = scribbles.map(s => {
    const label = s.attributes.title ? s.attributes.title : `$$${s.id}`;
    return (
      <ListItem key={s.id} button component={RouterLink} to={`/${s.id}`}>
        <ListItemText className={classes.root} primary={label} />
      </ListItem>
    );
  });

  return (
    <List dense>{scribbleItems}</List>
  );
}

export default React.memo(ScribblesList);
