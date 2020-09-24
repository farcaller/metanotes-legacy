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

import React from 'react';
import { StyleSheet, Text, View, SafeAreaView, ScrollView } from 'react-native';
import { Provider } from 'react-redux';
import { useSelector, useDispatch } from 'react-redux';

import Sheet from './Sheet';
import store, { selectSheets, loadSheets } from '@metanotes/store';
import run from '@metanotes/filter';

process.cwd = function () {
  return '/';
}

const App = () => {
  const sheets = useSelector(selectSheets);

  const dispatch = useDispatch();

  if (sheets === null) {
    dispatch(loadSheets());
  }

  const [filter, setFilter] = React.useState('');
  const onFilterUpdated = (event: React.ChangeEvent) => {
    setFilter((event.target! as any).value);
  };

  let filteredSheets = []
  try {
    filteredSheets = filter.length === 0 || sheets === null ? sheets : run(filter, sheets);
  } catch (err) {
    filteredSheets = [];
  }
  if (!filteredSheets) {
    filteredSheets = [];
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
      {
        (filteredSheets as any).map((sh: any) => <Sheet key={sh._id} sheet={sh} />)
      }
      </ScrollView>
    </SafeAreaView>
  );
}

export default () => <Provider store={store}><App/></Provider>;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
