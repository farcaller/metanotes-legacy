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
 * id: 01F7NDPGBQ8Z2SQ5GQX2QGNYF7
 * content-type: application/vnd.metanotes.component-jsmodule
 * title: $:ui/scribbles/open
 * display-title: Open Scribble
 */

import React from '@metascribbles/react';
import { observer } from '@metascribbles/store';
import { View } from '@metascribbles/react-native';

import OpenAll from '$:ui/scribbles/open/all';

function Open() {
  return (
    <View>
      <OpenAll />
    </View>
  );
}

export default observer(Open);
