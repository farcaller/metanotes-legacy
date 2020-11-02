const yaml = require('js-yaml');

module.exports = function (source, map) {
  const lines = source.split('\n');  

  // skip the license header
  while (lines[0].startsWith('//')) {
    lines.shift();
  }
  lines.shift();

  // check the magic
  if (lines.shift() !== '/* attributes *') {
    throw Error(`magic not found`);
  }

  const attrLines = []
  while (lines.length > 0) {
    const l = lines.shift();
    if (l === ' */') {
      break;
    }

    const groups = l.match(/ \* (.*)/);
    if (!groups) {
      throw Error(`cannot parse attibute from "${l}"`);
    }
    attrLines.push(groups[1]);
  }
  const attrsYAML = attrLines.join('\n');
  const attrs = yaml.safeLoad(attrsYAML);
  if (!attrs.id) {
    throw Error('id not present in attributes');
  }
  if (!attrs['content-type']) {
    throw Error('id not present in attributes');
  }
  const id = attrs.id;
  delete attrs.id;

  const body = lines.join('\n').trim();

  const doc = {
    id,
    body,
    attributes: attrs,
    status: 'core',
  }

  return 'module.exports = ' + JSON.stringify(doc);
};
