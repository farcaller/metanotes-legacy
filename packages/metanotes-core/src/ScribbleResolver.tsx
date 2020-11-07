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

import React, { Dispatch, useContext } from 'react';
import Alert from '@material-ui/core/Alert';
import LinearProgress from '@material-ui/core/LinearProgress';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import SpeedDial from '@material-ui/core/SpeedDial';
import SpeedDialIcon from '@material-ui/core/SpeedDialIcon';
import SpeedDialAction from '@material-ui/core/SpeedDialAction';
import TextField from '@material-ui/core/TextField';
import EditIcon from '@material-ui/icons/Edit';
import CloseIcon from '@material-ui/icons/Close';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import SaveIcon from '@material-ui/icons/Save';
import { useParams, Link as RouterLink, useHistory } from 'react-router-dom';
import { ControlledEditor as MonacoEditor } from '@monaco-editor/react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';

import { Scribble, SyncedScribble, ScribbleResolverContext, loadScribbleComponentModule, fetchScribble, ResolverQuery, ScribbleResolverContextType } from '@metanotes/store/lib/features/scribbles';
import Markdown from './components/Markdown';
import { CoreEventsContext } from './CoreEvents';

// TODO: unknown is a lie. it's a memo
const componentLocals: { [key: string]: unknown } = {
  Markdown,
  LinearProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  Grid,
  Paper,
  Card,
  CardHeader,
  CardContent,
  Typography,
  SpeedDial,
  SpeedDialIcon,
  SpeedDialAction,
  MonacoEditor,
  SyntaxHighlighter,
  TextField,
  IconButton,

  // TODO: does not belong here
  useParams,
  RouterLink,
  useHistory,
  icons: {
    EditIcon,
    CloseIcon,
    MoreVertIcon,
    SaveIcon,
  },
  useCoreEvents: () => useContext(CoreEventsContext),
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
