const Mod = require('module');
var requirejs = require('requirejs');
var path = require('path');
var _require = Mod.prototype.require;

requirejs.config({
  //Pass the top-level main.js/index.js require
  //function to requirejs so that node modules
  //are loaded relative to the top-level JS file.
  nodeRequire: require,
  paths: {
    metanotes: path.join(__dirname, '../..'),
  }
});

Mod.prototype.require = function (arg) {
  console.log('require', arg);
  if (arg.startsWith('metanotes')) {
    return requirejs.apply(this, arguments);
  } else {
    return _require.apply(this, arguments);
  }
};
