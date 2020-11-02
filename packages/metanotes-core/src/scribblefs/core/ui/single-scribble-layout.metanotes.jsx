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
 * id: 01ENT0T2HSX8J88NZ6R1RRC415
 * content-type: application/vnd.metanotes.component-jsmodule
 * title: $:core/ui/single-scribble-layout
 */

const { useScribble, useSelector, selectScribbleById } = core;
const { Grid, Paper, useParams } = components;

function SingleScribbleLayout() {
  const { id } = useParams();
  
  const scribble = useSelector(state => selectScribbleById(state, id));
  const ScribbleContainer = useScribble('$:core/ui/scribble-container');
  const ScribblesList = useScribble('$:core/ui/scribbles-list');

  return (
    <Grid container>
      <Grid item xs={3}>
        <Paper>
          <ScribblesList />
        </Paper>
      </Grid>
      <Grid item xs style={{marginLeft: 8, marginRight: 8}}>
        {scribble ? <ScribbleContainer scribble={scribble} /> : ''}
      </Grid>
    </Grid>
  )
}

export default React.memo(SingleScribbleLayout);
