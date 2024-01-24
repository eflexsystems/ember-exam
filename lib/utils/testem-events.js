'use strict';

const path = require('path');
const ExecutionStateManager = require('./execution-state-manager');
const writeJsonToFile = require('./file-system-helper');

/**
 * Return sorted module metadata object by module duration.
 *
 * @param {Map} moduleMetadata
 */
function getSortedModuleMetaData(moduleMetadata) {
  return new Map(
    [...moduleMetadata.entries()].sort((a, b) => b[1].duration - a[1].duration),
  );
}

/**
 * A class to coordinate testem events to enable load-balance functionality.
 *
 * @class TestemEvents
 */
class TestemEvents {
  constructor(root) {
    this.stateManager = new ExecutionStateManager();
    this.root = root;
  }

  /**
   * Record the launched browser id
   *
   * @param {number} browserId
   */
  recordStartedLauncherId(browserId) {
    this.stateManager.addToStartedLaunchers(browserId);
  }

  /**
   * Record the module run details to the stateManager
   *
   * @param {Object} metaData
   */
  recordModuleMetadata(metaData) {
    this.stateManager.addToModuleMetadata(metaData);
  }

  /**
   * Keep track of the number of browsers that completed executing its tests.
   * When all browsers complete, write test-execution.json to disk and clean up the stateManager
   *
   * @param {number} browserCount
   * @param {number} launcherId
   * @param {Object} ui
   * @param {Object} commands
   * @param {Object} currentDate
   */
  completedBrowsersHandler(
    browserCount,
    launcherId,
    ui,
    commands,
    currentDate,
  ) {
    const browsersStarted = this.stateManager.getStartedLaunchers();
    let browsersCompleted = false;

    this.stateManager.incrementCompletedBrowsers(launcherId);
    const completedBrowser = this.stateManager.getCompletedBrowser();
    if (completedBrowser === browsersStarted.size) {
      if (commands.get('writeModuleMetadataFile')) {
        const moduleDetailFileName = path.join(
          this.root,
          `module-metadata-${currentDate}.json`,
        );
        const sortedModuleMetadata = getSortedModuleMetaData(
          this.stateManager.getModuleMetadata(),
        );

        writeJsonToFile(
          moduleDetailFileName,
          {
            requested: `${browserCount} browser(s)`,
            launched: `${browsersStarted.size} browser(s)`,
            modules: Array.from(sortedModuleMetadata.values()),
          },
          { spaces: 2 },
        );
        ui.writeLine(
          `\nExecution module details were recorded at ${moduleDetailFileName}`,
        );
      }

      ui.writeLine(
        `Out of requested ${browserCount} browser(s), ${browsersStarted.size} browser(s) was launched & completed.`,
      );

      if (browserCount !== browsersStarted.size) {
        ui.writeLine('Waiting for remaining browsers to exited.');
      }
    }

    if (completedBrowser === browserCount) {
      ui.writeLine('All browsers to exited.');
      // --server mode allows rerun of tests by refreshing the browser
      // replayExecutionMap should be reused so the test-execution json
      // does not need to be reread
      const replayExecutionMap = this.stateManager.getReplayExecutionMap();
      this.stateManager = new ExecutionStateManager(replayExecutionMap);
      browsersCompleted = true;
    }
    return browsersCompleted;
  }
}

module.exports = TestemEvents;
