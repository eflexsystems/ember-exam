'use strict';

const assert = require('assert');
const fs = require('fs-extra');
const path = require('path');
const TestemEvents = require('../../../lib/utils/testem-events');

const fixtureDir = 'tmp/fixture';

describe('TestemEvents', function () {
  beforeEach(function () {
    fs.mkdirpSync(fixtureDir);
    this.testemEvents = new TestemEvents(fixtureDir);
  });

  afterEach(function () {
    fs.removeSync(fixtureDir);
  });

  describe('completedBrowsersHandler', function () {
    const mockUi = {
      writeLine: () => {},
    };

    it('should increment completedBrowsers only when completedBrowsers is less than browserCount', function () {
      this.testemEvents.completedBrowsersHandler(
        2,
        1,
        mockUi,
        new Map(),
        '0000',
      );

      assert.strictEqual(
        this.testemEvents.stateManager.getCompletedBrowser(),
        1,
        'completedBrowsers was incremented',
      );
    });

    it('should write module-run-details file with sorted by duration', function () {
      this.testemEvents.stateManager.addToModuleMetadata({
        moduleName: 'a',
        testName: 'test 1',
        passed: true,
        failed: false,
        skipped: false,
        duration: 1,
      });
      this.testemEvents.stateManager.addToModuleMetadata({
        moduleName: 'a',
        testName: 'test 2',
        passed: false,
        failed: true,
        skipped: false,
        duration: 8,
      });
      this.testemEvents.stateManager.addToModuleMetadata({
        moduleName: 'b',
        testName: 'test 1',
        passed: true,
        failed: false,
        skipped: false,
        duration: 1,
      });

      this.testemEvents.stateManager.addToStartedLaunchers(1010);

      this.testemEvents.completedBrowsersHandler(
        1,
        1,
        mockUi,
        new Map([['writeModuleMetadataFile', true]]),
        '0000',
      );

      const actual = fs.readFileSync(
        path.join(fixtureDir, 'module-metadata-0000.json'),
      );

      assert.deepEqual(JSON.parse(actual).modules, [
        {
          moduleName: 'a',
          total: 2,
          passed: 1,
          failed: 1,
          skipped: 0,
          duration: 9,
          failedTests: ['test 2'],
        },
        {
          moduleName: 'b',
          total: 1,
          passed: 1,
          failed: 0,
          skipped: 0,
          duration: 1,
          failedTests: [],
        },
      ]);
    });

    it('should add skipped test number to write module-metadata-file with sorted by duration', function () {
      this.testemEvents.stateManager.addToModuleMetadata({
        moduleName: 'a',
        testName: 'test 1',
        passed: true,
        failed: false,
        skipped: true,
        duration: 0,
      });
      this.testemEvents.stateManager.addToModuleMetadata({
        moduleName: 'a',
        testName: 'test 2',
        passed: false,
        failed: true,
        skipped: false,
        duration: 8,
      });
      this.testemEvents.stateManager.addToModuleMetadata({
        moduleName: 'b',
        testName: 'test 1',
        passed: true,
        failed: false,
        skipped: false,
        duration: 1,
      });
      this.testemEvents.stateManager.addToModuleMetadata({
        moduleName: 'b',
        testName: 'test 1',
        passed: true,
        failed: false,
        skipped: false,
        duration: 0,
      });
      this.testemEvents.stateManager.addToModuleMetadata({
        moduleName: 'b',
        testName: 'test 1',
        paseed: true,
        failed: false,
        skipped: true,
        duration: 1,
      });

      this.testemEvents.stateManager.addToStartedLaunchers(1010);

      this.testemEvents.completedBrowsersHandler(
        1,
        1,
        mockUi,
        new Map([['writeModuleMetadataFile', true]]),
        '0000',
      );

      const actual = fs.readFileSync(
        path.join(fixtureDir, 'module-metadata-0000.json'),
      );

      assert.deepEqual(JSON.parse(actual).modules, [
        {
          moduleName: 'a',
          total: 2,
          passed: 0,
          failed: 1,
          skipped: 1,
          duration: 8,
          failedTests: ['test 2'],
        },
        {
          moduleName: 'b',
          total: 3,
          passed: 2,
          failed: 0,
          skipped: 1,
          duration: 2,
          failedTests: [],
        },
      ]);
    });

    it('should increment completedBrowsers', function () {
      this.testemEvents.completedBrowsersHandler(
        2,
        1,
        mockUi,
        new Map(),
        '0000',
      );

      assert.strictEqual(
        this.testemEvents.stateManager.getCompletedBrowser(),
        1,
        'completedBrowsers was incremented',
      );
    });

    it('should clean up states from stateManager when all launched browsers exited', function () {
      this.testemEvents.stateManager.addToStartedLaunchers(1010);
      this.testemEvents.stateManager.addToStartedLaunchers(1011);

      this.testemEvents.completedBrowsersHandler(
        2,
        1010,
        mockUi,
        new Map(),
        '0000',
      );

      assert.deepEqual(this.testemEvents.stateManager.getModuleMap().size, 0);
    });
  });
});
