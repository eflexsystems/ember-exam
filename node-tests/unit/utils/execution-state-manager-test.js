'use strict';

const assert = require('assert');
const ExecutionStateManager = require('../../../lib/utils/execution-state-manager');

describe('ExecutionStateManager', function () {
  beforeEach(function () {
    this.stateManager = new ExecutionStateManager();
  });

  describe('initializeStates', function () {
    it('initialize states', function () {
      assert.deepEqual(this.stateManager.getModuleMap().size, 0);
    });
  });

  describe('completedBrowsers', function () {
    it('incrementCompletedBrowsers called for the same browserId will only be accounted once', function () {
      this.stateManager.incrementCompletedBrowsers(1);
      this.stateManager.incrementCompletedBrowsers(1);

      assert.deepEqual(this.stateManager.getCompletedBrowser(), 1);
    });
  });

  describe('moduleRunDetails', function () {
    it('returns a map size of 0', function () {
      assert.strictEqual(this.stateManager.getModuleMetadata().size, 0);
    });

    it('adds a single testDone module metadata to moduleMetadata.', function () {
      const testModuleName = 'foo';
      const moduleMetadata = {
        moduleName: testModuleName,
        testName: 'testing foo',
        passed: 1,
        failed: 0,
        skipped: false,
        total: 1,
        duration: 1,
      };

      this.stateManager.addToModuleMetadata(moduleMetadata);

      const fooModuleMetadata = this.stateManager
        .getModuleMetadata()
        .get(testModuleName);

      assert.strictEqual(fooModuleMetadata.passed, 1);
      assert.strictEqual(fooModuleMetadata.failed, 0);
      assert.strictEqual(fooModuleMetadata.skipped, 0);
      assert.strictEqual(fooModuleMetadata.duration, 1);
      assert.strictEqual(fooModuleMetadata.failedTests.length, 0);
    });

    it('adds two test metadata and returns cumulative module data', function () {
      const fooTestModule = 'foo';
      const fooTestMetadata = {
        moduleName: fooTestModule,
        testName: 'testing foo',
        passed: 1,
        failed: 0,
        skipped: false,
        total: 1,
        duration: 1,
      };

      const barTestMetadata = {
        moduleName: fooTestModule,
        testName: 'testing bar',
        passed: 0,
        failed: 1,
        skipped: false,
        total: 1,
        duration: 1.8,
      };

      this.stateManager.addToModuleMetadata(fooTestMetadata);
      this.stateManager.addToModuleMetadata(barTestMetadata);

      const fooModuleMetadata = this.stateManager
        .getModuleMetadata()
        .get(fooTestModule);

      assert.strictEqual(fooModuleMetadata.total, 2);
      assert.strictEqual(fooModuleMetadata.passed, 1);
      assert.strictEqual(fooModuleMetadata.failed, 1);
      assert.strictEqual(fooModuleMetadata.skipped, 0);
      assert.strictEqual(fooModuleMetadata.duration, 2.8);
      assert.strictEqual(fooModuleMetadata.failedTests.length, 1);
    });
  });
});
