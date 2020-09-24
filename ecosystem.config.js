module.exports = {
  apps : [
    {
      name: 'web',
      script: 'yarn workspace metanotes-web start',
    }, {
      name: 'mobile',
      script: 'yarn workspace metanotes-mobile start',
    }, {
      name: 'metanotes-server',
      script: 'yarn workspace metanotes-server start:watch',
      watch: './packages/metanotes-server/src'
    }, {
      name: 'remark-metareact',
      script: 'yarn workspace @metanotes/remark-metareact build:watch',
    }, {
      name: 'metanotes-filter',
      script: 'yarn workspace @metanotes/filter build:watch',
    }, {
      name: 'metanotes-store',
      script: 'yarn workspace @metanotes/store build:watch',
    }
  ],
};
