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
 * id: 01EPP9F7NWTJ03TNKCK3AZFETV
 * content-type: application/vnd.metanotes.component-jsmodule
 * title: $:core/ui/scribble-attributes-editor
 */

const { useMemo, useState, useCallback } = React;
const { useDispatch, useSelector, selectScribbleById, createCachedSelector, updateScribbleAttributes, removeScribbleAttributes, equals } = core;
const { TextField, Button } = components;

const NonEditableAttributes = ['title', 'content-type', 'mn-draft-of', 'tags'];

const filtered = (attrs, nonValidKeys) => Object.keys(attrs).filter(k => !nonValidKeys.includes(k)).reduce((obj, key) => ({ ...obj, [key]: attrs[key] }), {});

const selectScribbleEditableAttributesById = createCachedSelector(
  selectScribbleById,
  (scribble) => filtered(scribble.attributes, NonEditableAttributes),
)((_, id) => id);

function RemoveButton({ id, name }) {
  const dispatch = useDispatch();

  const onRemove = useCallback(() => {
    dispatch(removeScribbleAttributes({
      id,
      attributes: [name],
    }));
  }, [id, name]);

  return <Button color="primary" onClick={onRemove}>remove</Button>;
}

function ScribbleAttributesEditor({ id }) {
  const attributes = useSelector(state => selectScribbleEditableAttributesById(state, id), equals);

  const dispatch = useDispatch();

  const [newName, setNewName] = useState('');
  const [newValue, setNewValue] = useState('');
  const [isReservedName, setIsReservedName] = useState(false);

  const onChangeNewName = useCallback((event) => {
    setNewName(event.target.value);
    setIsReservedName(NonEditableAttributes.includes(event.target.value));
  });
  const onChangeNewValue = useCallback((event) => {
    setNewValue(event.target.value);
  });
  const onAddNew = useCallback((event) => {
    if (isReservedName) { return }

    dispatch(updateScribbleAttributes({
      id,
      attributes: {
        [newName]: newValue,
      },
    }));
    setNewName('');
    setNewValue('');
  }, [id, newName, newValue]);

  const onChangeValue = useCallback((event) => {
    dispatch(updateScribbleAttributes({
      id,
      attributes: {
        [event.target.name]: event.target.value,
      },
    }));
  }, [id, attributes]);

  const attributeKeys = Object.keys(attributes).sort();
  const attributeElements = attributeKeys.map(k => 
    <tr key={k} style={{ width: '100%' }}>
      <td style={{ width: '30%' }}>
        {k}
      </td>
      <td>
        <TextField
          fullWidth
          size="small"
          name={k}
          value={attributes[k]}
          onChange={onChangeValue}
        />
      </td>
      <td style={{ width: '1%' }}>
        <RemoveButton id={id} name={k} />
      </td>
    </tr>
  );
  attributeElements.push(<tr key="__add_new__" style={{ width: '100%' }}>
    <td style={{ width: '30%' }}>
      <TextField
        fullWidth
        size="small"
        label="attribute name"
        value={newName}
        onChange={onChangeNewName}
        error={isReservedName}
        helperText={isReservedName ? `"${newName}" is a reserved name` : ''}
      />
    </td>
    <td><TextField fullWidth size="small" label="attribute value" value={newValue} onChange={onChangeNewValue} /></td>
    <td style={{ width: '1%' }}><Button color="primary" onClick={onAddNew}>add</Button></td>
  </tr>);

  return (
    <table style={{ width: '100%' }}><tbody>{attributeElements}</tbody></table>
  );
}

export default React.memo(ScribbleAttributesEditor);
