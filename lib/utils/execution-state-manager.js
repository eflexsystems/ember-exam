'use strict';

/**
 * A class to store the state of an execution.
 *
 * @class ExecutionStateManager
 */
class ExecutionStateManager {
  constructor() {
    // A set of launcher id of attached browsers
    this._startedLaunchers = new Set();

    // A map of browserId to test modules executed for the current test execution.
    this._browserToModuleMap = new Map();

    // A map keeping the module execution details
    this._moduleMetadata = new Map();

    // An array keeping the browserId of a browser with failing test
    this._failedBrowsers = [];
    this._completedBrowsers = new Map();
  }

  /**
   * Returns the startedLaunchers
   *
   * @returns {Set}
   */
  getStartedLaunchers() {
    return this._startedLaunchers;
  }

  /**
   * Add a new laucnher id to the startedLaunchers array.
   *
   * @param {number} launcherId
   * @returns {Boolean}
   */
  addToStartedLaunchers(launcherId) {
    return this._startedLaunchers.add(launcherId);
  }

  /**
   * Returns the a map of browserId to modules array
   *
   * @returns {Object}
   */
  getModuleMap() {
    return this._browserToModuleMap;
  }

  /**
   * Returns an array of modules run details
   *
   * @returns {Array}
   */
  getModuleMetadata() {
    return this._moduleMetadata;
  }

  /**
   * Pushes the moduleName into the moduleArray of browserId
   *
   * @param {string} moduleName
   * @param {number} browserId
   */
  addModuleNameToReplayExecutionMap(moduleName, browserId) {
    let browserModuleList = this._browserToModuleMap.get(browserId);
    if (Array.isArray(browserModuleList)) {
      browserModuleList.push(moduleName);
    } else {
      browserModuleList = [moduleName];
    }
    this._browserToModuleMap.set(browserId, browserModuleList);
  }

  /**
   * Add module metadata mapped by moduleName to moduleMetadata Map.
   *
   * @param {string} moduleName
   * @param {number} total - Total number of tests
   * @param {number} passed - Number of passed tests
   * @param {number} failed - Number of failed tests
   * @param {number} duration - duration to execute tests in module in ms
   * @param {Array<string>} failedTests - A list of failed test names
   */
  _injectModuleMetadata(
    moduleName,
    total,
    passed,
    failed,
    skipped,
    duration,
    failedTests,
  ) {
    this._moduleMetadata.set(moduleName, {
      moduleName,
      total,
      passed,
      failed,
      skipped,
      duration,
      failedTests,
    });
  }

  /**
   * Pushes the module detail into the moduleMetadata array
   *
   * @param {Object} metaData
   */
  addToModuleMetadata(metadata) {
    if (!this._moduleMetadata.has(metadata.moduleName)) {
      // modulename, total, passed, failed, skipped, duration, failed tests
      this._injectModuleMetadata(metadata.moduleName, 0, 0, 0, 0, 0, []);
    }

    const curModuleMetadata = this._moduleMetadata.get(metadata.moduleName);

    if (!metadata.skipped && metadata.failed) {
      curModuleMetadata.failedTests.push(metadata.testName);
    }

    this._injectModuleMetadata(
      metadata.moduleName,
      curModuleMetadata.total + 1,
      !metadata.skipped && metadata.passed
        ? curModuleMetadata.passed + 1
        : curModuleMetadata.passed,
      !metadata.skipped && metadata.failed
        ? curModuleMetadata.failed + 1
        : curModuleMetadata.failed,
      metadata.skipped
        ? curModuleMetadata.skipped + 1
        : curModuleMetadata.skipped,
      curModuleMetadata.duration + metadata.duration,
      curModuleMetadata.failedTests,
    );
  }

  /**
   * Returns the number of completed browsers
   *
   * @returns {number}
   */
  getCompletedBrowser() {
    return this._completedBrowsers.size;
  }

  /**
   * Book keep the browser id that has completed
   *
   * @param {number} browserId
   */
  incrementCompletedBrowsers(browserId) {
    this._completedBrowsers.set(browserId, true);
  }
}

module.exports = ExecutionStateManager;
