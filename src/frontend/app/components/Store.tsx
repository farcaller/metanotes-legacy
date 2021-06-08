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

import React, { useEffect, useState } from 'react';

import { createBackend, StorageAPI } from '../../store/client';
import StoreProvider from '../../store/provider';

function Store({ children }: React.PropsWithChildren<Record<string, unknown>>): JSX.Element {
  const [api, setAPI] = useState<StorageAPI>();

  useEffect(() => {
    const backendAddress = process.env.NODE_ENV === 'development'
      ? 'http://localhost:55080' : `${window.location.protocol}//${window.location.host}`;

    setAPI(createBackend({
      backend: 'metanotes-server',
      config: { hostname: backendAddress },
    }));
  }, []);

  return (
    <StoreProvider api={api}>{children}</StoreProvider>
  );
}

export default Store;
