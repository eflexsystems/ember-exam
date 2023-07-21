'use strict';

const EmberAddon = require('ember-cli/lib/broccoli/ember-addon');

module.exports = function (defaults) {
  const self = defaults.project.findAddonByName('@eflexsystems/ember-exam');
  const autoImport = self.options.autoImport;
  let app = new EmberAddon(defaults, {
    autoImport,
  });

  const { maybeEmbroider } = require('@embroider/test-setup');
  return maybeEmbroider(app, {
    packagerOptions: {
      webpackConfig: {
        externals: {
          mocha: 'mocha',
        },
      },
    },
  });
};
