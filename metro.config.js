/**
 * Metro configuration for React Native
 * https://github.com/facebook/react-native
 *
 * @format
 */

const metroResolver = require('metro-resolver');
const path = require('path');
// const tsConfig = require("./tsconfig.json");
// const rootDirs = tsConfig.compilerOptions.rootDirs;
// TODO: tsconfig.json isn't valid json, lol. pull in json5?
const rootDirs = [
  ".",
  "./bazel-out/darwin-fastbuild/bin",
  "./bazel-out/k8-fastbuild/bin",
  "./bazel-out/x64_windows-fastbuild/bin",
  "./bazel-out/darwin-dbg/bin",
  "./bazel-out/k8-dbg/bin",
  "./bazel-out/x64_windows-dbg/bin",
];

module.exports = {
  // projectRoot: '',  // TODO: do we actually need this?
  resolver: {
    resolveRequest: (_context, realModuleName, platform, moduleName) => {
      console.log(`[BAZEL] Resolving: ${moduleName}`);

      const { resolveRequest, ...context } = _context;
      try {
        return metroResolver.resolve(context, moduleName, platform);
      } catch (e) {
        console.log(`[BAZEL] Unable to resolve with default Metro resolver: ${moduleName}`);
      }
      try {
        const absOriginalModuleDir = path.dirname(_context.originModulePath);
        const relOriginalModuleDir = absOriginalModuleDir.replace(__dirname, './');
        // NB: it seems that the above ./ doesn't work while the below does, because
        //     path.join actually eats it up and simplifies the path. require.resolve()
        //     needs it though, to do the "local" resolution.
        const relPath = './' + path.join(relOriginalModuleDir, realModuleName);
        console.log(`[BAZEL] Resolving manually: ${relPath}`);
        console.log(`[BAZEL] absOriginalModuleDir=${absOriginalModuleDir})`);
        console.log(`[BAZEL] relOriginalModuleDir=${relOriginalModuleDir})`);
        // NB: we only care about .js files from in here as tsc would have processed them anyways
        const match = require.resolve(relPath, { paths: rootDirs });
        return {
          type: 'sourceFile',
          filePath: match,
        };
      } catch (e) {
        console.log(`[BAZEL] Unable to resolve with require.resolve: ${moduleName}`);
      }
    },
  },
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
  },
};
