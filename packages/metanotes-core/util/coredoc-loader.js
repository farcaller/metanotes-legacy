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

  let id;
  const attributes = {};
  while (lines.length > 0) {
    const l = lines.shift();
    if (l === ' */') {
      break;
    }

    const groups = l.match(/ \*\s+([\w-]+):\s*(.+)/);
    if (!groups) {
      throw Error(`cannot parse attibute from "${l}"`);
    }
    const aname = groups[1];
    const aval = groups[2];
    switch (aname) {
      case 'id':
        id = aval;
        break;
      default:
        attributes[aname] = aval;
    }
  }

  const body = lines.join('\n').trim();

  const doc = {
    id,
    body,
    attributes,
    status: 'core',
  }

  return 'module.exports = ' + JSON.stringify(doc);
};
