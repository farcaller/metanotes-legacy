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

  const attrs = {};
  while (lines.length > 0) {
    const l = lines.shift();
    if (l === ' */') {
      break;
    }

    const groups = l.match(/ \*\s+([^:]+)\s*:\s*(.*)/);
    if (!groups) {
      throw Error(`cannot parse attibute from "${l}"`);
    }
    attrs[groups[1]] = groups[2];
  }
  if (!attrs.id) {
    throw Error('id not present in attributes');
  }
  if (!attrs['content-type']) {
    throw Error('content-type not present in attributes');
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
