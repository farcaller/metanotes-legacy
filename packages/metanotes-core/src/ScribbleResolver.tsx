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

import React, { Dispatch } from 'react';
import Alert from '@material-ui/lab/Alert';
import { LinearProgress } from '@material-ui/core';

import { Scribble, SyncedScribble, ScribbleResolverContext, loadScribbleComponentModule, fetchScribble, ResolverQuery, ScribbleResolverContextType } from '@metanotes/store/lib/features/scribbles';
import Markdown from './components/Markdown';

// TODO: unknown is a lie. it's a memo
const componentLocals: { [key: string]: unknown } = {
  Markdown,
  LinearProgress,
  Alert,
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function resolver({ title }: ResolverQuery, dispatch: Dispatch<any>, scribble?: Scribble): React.FunctionComponent<unknown> {
  if (scribble === undefined) {
    // TODO: these will cause re-renders every time because they return new components.
    return () => <Alert severity="error">cannot find scribble named <code>{title}</code></Alert>;
  }
  switch (scribble.status) {
    case 'core':
    case 'synced':
      try {
        return loadScribbleComponentModule(scribble as SyncedScribble, componentLocals as { [key: string]: React.FunctionComponent<unknown> });
      } catch (e) {
        const err = e as Error;
        return () => <Alert severity="error">loading scribble failed: <code>{err.name}</code><pre>{err.stack ? err.stack : err.message}</pre></Alert>;
      }
    case 'syncedMetadataOnly':
      dispatch(fetchScribble(scribble));
      return () => <LinearProgress />;
    case 'pullingBody':
      return () => <LinearProgress />;
    case 'failed':
      return () => <Alert severity="error">loading scribble failed: <code>{scribble.error}</code></Alert>;
    default:
      throw Error('wtf');
  }
}

export class ErrorBoundary extends React.PureComponent<{ children: JSX.Element }, {error?: Error}> {
  constructor(props: {children: JSX.Element}) {
    super(props);
    this.state = { error: undefined };
  }

  static getDerivedStateFromError(error: Error): { error?: Error } {
    console.error('getDerivedStateFromError:', error);
    return { error };
  }

  componentDidCatch(error: Error, errorInfo: unknown): void {
    console.error('componentDidCatch:', error, errorInfo);
    this.setState({ error });
  }

  render(): JSX.Element {
    if (this.state.error !== undefined) {
      return <Alert severity="error">rendering scribble failed: <code>{this.state.error}</code></Alert>;
    }

    return this.props.children;
  }
}


const ctx = {
  resolver,
  errorBoundary: ErrorBoundary,
};

function ScribbleResolver({ children }: { children: JSX.Element}): JSX.Element {
  return (
    <ScribbleResolverContext.Provider value={ctx as unknown as ScribbleResolverContextType}>
      {children}
    </ScribbleResolverContext.Provider>
  );
}

export default React.memo(ScribbleResolver);
