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

/* eslint-disable react/destructuring-assignment */

import React from 'react';
import Alert from '@material-ui/core/Alert';

export default class ErrorBoundary extends React.Component<{ children: JSX.Element; }, { error?: Error; }> {
  constructor(props: { children: JSX.Element; }) {
    super(props);
    this.state = { error: undefined };
  }

  shouldComponentUpdate(nextProps: { children: JSX.Element; }, nextState: { error?: Error; }): boolean {
    return (this.state.error !== nextState.error) || (this.props.children !== nextProps.children);
  }

  componentDidUpdate(prevProps: { children: JSX.Element; }): void {
    if (this.props.children !== prevProps.children && this.state.error !== undefined) {
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({ error: undefined });
    }
  }

  static getDerivedStateFromError(error: Error): { error?: Error; } {
    return { error };
  }

  componentDidCatch(error: Error, _errorInfo: unknown): void {
    this.setState({ error });
  }

  render(): JSX.Element {
    if (this.state.error !== undefined) {
      return (
        <Alert severity="error">
          <div>rendering scribble failed</div>
          <code>{JSON.stringify(this.state.error)}</code>
        </Alert>
      );
    }

    return this.props.children;
  }
}
