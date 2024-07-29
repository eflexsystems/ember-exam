import loadEmberExam from '@eflexsystems/ember-exam/test-support/load';
import { start as mochaStart } from '@eflexsystems/ember-mocha';

/**
 * Equivalent to ember-qunit's loadTest() except this does not create a new TestLoader instance
 *
 * @function loadTests
 * @param {*} testLoader
 */
function loadTests(testLoader) {
  if (testLoader === undefined) {
    throw new Error(
      'A testLoader instance has not been created. You must call `loadEmberExam()` before calling `loadTest()`.',
    );
  }

  testLoader.loadModules();
}

/**
 * Ember-exam's own start function to set up EmberExamTestLoader, load tests and calls start() from
 * ember-qunit
 *
 * @function start
 * @param {*} qunitOptions
 */
export default function start(options) {
  const modifiedOptions = options || Object.create(null);
  modifiedOptions.loadTests = false;

  const testLoader = loadEmberExam();
  loadTests(testLoader);
  mochaStart(modifiedOptions);
}
