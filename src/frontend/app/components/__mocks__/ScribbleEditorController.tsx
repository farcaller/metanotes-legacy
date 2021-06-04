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

// NB: This mock exists so as not to depend on jsdom as Monaco Editor uses window otherwise.

import React, { useCallback, useState } from 'react';
import { observer } from 'mobx-react-lite';

import { Scribble } from '../../../store/interface/scribble';
import ScribbleHeader from '../ScribbleHeader';
import { TitleKey } from '../../../store/interface/metadata';

function ScribbleEditorController({ scribble }: { scribble: Scribble }) {
  const [workVersion] = useState(scribble.latestVersion);

  const [workBody] = useState(workVersion.body !== null ? workVersion.body : '');

  const onSave = useCallback((title: string) => {
    let value = '';
    value = workBody;
    const meta = workVersion.clonedMetadata;
    meta.delete('mn-draft');
    meta.set(TitleKey, title);
    scribble.createStableVersion(value, meta);
  }, [scribble, workVersion, workBody]);

  return (
    <>
      <ScribbleHeader scribble={scribble} onSave={onSave} />
    </>
  );
}

export default observer(ScribbleEditorController);
