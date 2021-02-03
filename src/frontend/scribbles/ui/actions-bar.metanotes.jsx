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
 * id: 01EQ400VFT513W65P9W14CT3N4
 * content-type: application/vnd.metanotes.component-jsmodule
 * title: $:core/ui/actions-bar
 * list: ['$:core/ui/actions/bar/new', '$:core/ui/actions/bar/upload-image', '$:core/ui/actions/bar/sync']
 */

const { useContext, useMemo } = React;
const {
  useDispatch, useSelector, selectScribblesByTag, equals, loadScribbleComponent, UseScribbleContext, ScribbleResolverContext } = core;


function ActionsBar() {
  const actionScribbles = useSelector(state => selectScribblesByTag(state, '$:core/ui/actions-bar'), equals);

  const cache = useContext(UseScribbleContext);
  const resolver = useContext(ScribbleResolverContext);
  const dispatch = useDispatch();
  const actions = useMemo(() => actionScribbles.map(scribble => {
    const Comp = loadScribbleComponent(resolver, dispatch, cache, scribble.attributes.title, scribble);
    return <Comp key={scribble.id} />;
  }), [resolver, dispatch, cache]);

  return (
    <>{actions}</>
  )
}

export default React.memo(ActionsBar);
