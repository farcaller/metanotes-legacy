const path = require('path');
var glob = require('glob');


function loadScribbles(t) {
  const scribbles = glob.sync('./src/scribblefs/**/*.js*');
  return t.ArrayExpression(scribbles.map(s =>
    t.CallExpression(t.Identifier('require'), [t.StringLiteral(s.replace('./src/scribblefs', '.'))])
  ));
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
