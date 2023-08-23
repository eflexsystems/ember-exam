import {
  dependencySatisfies,
  macroCondition,
  importSync,
} from '@embroider/macros';

/**
 * Returns ember-exam-qunit-test-loader or ember-exam-mocha-test-loader
 *
 * @export
 * @function getTestLoader
 * @return {Object}
 */
export default function getTestLoader() {
  if (macroCondition(dependencySatisfies('ember-qunit', '*'))) {
    const EmberExamQUnitTestLoader = importSync(
      '@eflexsystems/ember-exam/test-support/-private/ember-exam-qunit-test-loader'
    );
    return EmberExamQUnitTestLoader['default'];
  } else if (
    macroCondition(dependencySatisfies('@eflexsystems/ember-mocha', '*'))
  ) {
    const EmberExamMochaTestLoader = importSync(
      '@eflexsystems/ember-exam/test-support/-private/ember-exam-mocha-test-loader'
    );
    return EmberExamMochaTestLoader['default'];
  }

  throw new Error(
    'Unable to find a suitable test loader. You should ensure that one of `ember-qunit` or `ember-mocha` are added as dependencies.'
  );
}
