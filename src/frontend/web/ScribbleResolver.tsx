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
import Button from '@material-ui/core/Button';
import SpeedDial from '@material-ui/core/SpeedDial';
import SpeedDialAction from '@material-ui/core/SpeedDialAction';
import TextField from '@material-ui/core/TextField';
import Icon from '@material-ui/core/Icon';
import { useParams, Link as RouterLink, useHistory, useLocation } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import Autocomplete from '@material-ui/core/Autocomplete';
import { useDebouncedCallback } from 'use-debounce';
import { makeStyles } from '@material-ui/core/styles';
import Parsimmon from 'parsimmon';

import {
  Scribble,
  SyncedScribble,
  ScribbleResolverContext,
  loadScribbleComponentModule,
  fetchScribble,
  ResolverQuery,
  ScribbleResolverContextType,
} from '../store/features/scribbles';
import Markdown from './components/Markdown';
import { CoreEventsContext } from './CoreEvents';
import { parse as parseMarkdown } from '../metamarkdown/ast';
import markdownComponents from './components/Markdown/components';
import makeParser, { buildLanguage } from '../metamarkdown/parser/parser';
import ErrorBoundary from './ErrorBoundary';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function resolver({ title }: ResolverQuery, dispatch: Dispatch<any>, scribble?: Scribble): React.ComponentType {
  if (scribble === undefined) {
    // TODO: these will cause re-renders every time because they return new components.
    return () => (
      <Alert severity="error">
        cannot find scribble named
        <code>{title}</code>
      </Alert>
    );
  }
  switch (scribble.status) {
    case 'core':
    case 'synced':
      try {
        return loadScribbleComponentModule(
          scribble as SyncedScribble,
          // eslint-disable-next-line @typescript-eslint/no-use-before-define
          componentLocals as { [key: string]: React.ComponentType },
        );
      } catch (e) {
        const err = e as Error;
        console.error('loading scribble failed:', scribble);
        return () => (
          <Alert severity="error">
            loading scribble
            {title}
            (id:
            {scribble.id}
            )
            failed:
            <code>{err.name}</code>
            <pre>{err.stack ? err.stack : err.message}</pre>
          </Alert>
        );
      }
    case 'syncedMetadataOnly':
      dispatch(fetchScribble(scribble));
      return () => <LinearProgress />;
    case 'pullingBody':
      return () => <LinearProgress />;
    case 'failed':
      return () => (
        <Alert severity="error">
          fetching scribble
          {title}
          (id:
          {scribble.id}
          )
          failed:
          <code>{scribble.error}</code>
        </Alert>
      );
    default:
      throw Error('wtf');
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
  SpeedDialAction,
  MonacoEditor: Editor,
  SyntaxHighlighter,
  TextField,
  IconButton,
  Autocomplete,
  Button,

  // TODO: does not belong here
  useParams,
  RouterLink,
  useHistory,
  useLocation,
  // TODO: this now takes up 37% of the runtime, split into a chunk?
  Icon,
  useCoreEvents: () => useContext(CoreEventsContext),
  ErrorBoundary,
  useDebouncedCallback,
  makeStyles,

  // TODO: test only?
  parseMarkdown,
  markdownComponents,
  makeParser,
  buildLanguage,
  Parsimmon,
};

export default React.memo(ScribbleResolver);
