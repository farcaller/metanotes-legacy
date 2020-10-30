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
 * title: $:core/app
 */

const { useScribble, useSelector, selectScribbleById, useDispatch, fetchScribble } = core;
const { LinearProgress } = components;

function AppScribble() {
  const dispatch = useDispatch();
  const scribble = useSelector(state => selectScribbleById(state, '01EHHQDDF415GCT10BF96DZ31F'));
  const ScribbleContainer = useScribble('$:core/ui/scribble-container');

  return (
    <ScribbleContainer scribble={scribble} />
  )
}

export default React.memo(AppScribble);
