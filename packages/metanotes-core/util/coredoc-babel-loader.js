const fs = require('fs');
const path = require('path');
var glob = require('glob');

// TODO: must be a better way
const SCRIBBLEFS = './src/scribblefs';
const METANOTES_DOC_REGEX = /.+\.metanotes.+$/

function loadScribble(t, filename) {
  // filename = path.resolve(path.join(SCRIBBLEFS, filename));
  const source = fs.readFileSync(filename, { encoding: 'utf-8'});

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

  return t.ObjectExpression([
    t.ObjectProperty(t.StringLiteral('id'), t.StringLiteral(id)),
    t.ObjectProperty(t.StringLiteral('body'), t.StringLiteral(body)),
    t.ObjectProperty(t.StringLiteral('attributes'), t.ObjectExpression(Object.keys(attrs).map(k => {
      return t.ObjectProperty(t.StringLiteral(k), t.StringLiteral(attrs[k]));
    }))),
    t.ObjectProperty(t.StringLiteral('status'), t.StringLiteral('core')),
  ])
}

function loadScribbles(t) {
  const scribbles = glob.sync('./src/scribblefs/**/*.js*');
  const scribbleDocs = scribbles.map(s => loadScribble(t, s));

  return t.ArrayExpression(scribbleDocs);
}

module.exports = function babelPluginInlineJsonImports({ types: t }) {
  return {
    visitor: {
      CallExpression: {
        exit(path, state) {
          const { node } = path;

          if (
            node.callee.type === 'Identifier' &&
            node.callee.name === 'require' &&
            node.arguments.length == 1 &&
            node.arguments[0].type === 'StringLiteral' &&
            // node.arguments[0].value.match(METANOTES_DOC_REGEX)
            node.arguments[0].value === '__MAGIC__SCRIBBLES__'
          ) {
            const sc = loadScribbles(t);
            path.replaceWith(sc);
          }
        },
      },
    },
  }
}
