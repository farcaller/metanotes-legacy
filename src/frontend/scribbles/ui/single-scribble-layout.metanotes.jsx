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
  
  const scribbleExists = useSelector(state => selectScribbleById(state, id) !== undefined);
  const ScribbleContainer = useScribble('$:core/ui/scribble-container');
  const ScribblesList = useScribble('$:core/ui/scribbles-list');
  const ActionsBar = useScribble('$:core/ui/actions-bar');

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '300px auto' }}>
      <div>
        <Paper>
          <ActionsBar />
        </Paper>
        <Paper>
          <ScribblesList />
        </Paper>
      </div>
      <div style={{marginLeft: 8, marginRight: 8}}>
        {scribbleExists ? <ScribbleContainer id={id} /> : ''}
      </div>
    </div>
  )
}

export default React.memo(SingleScribbleLayout);
