/* eslint-env node */

'use strict';

module.exports = {
  name: require('./package').name,
  options: {
    autoImport: {
      exclude: ['mocha'],
    },
  },

  includedCommands() {
    return require('./lib/commands');
  },
};
