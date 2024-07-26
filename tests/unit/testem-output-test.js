import * as TestemOutput from '@eflexsystems/ember-exam/test-support/-private/patch-testem-output';
import { expect } from 'chai';

describe('Unit | Mocha | patch-testem-output', function () {
  describe('`preserveTestName` is passed', function () {
    it('does not add partition number to test name when `split` is passed', function () {
      expect(
        TestemOutput.updateTestName(
          new Map().set('split', 2).set('preserveTestName', true),
          'test_module | test_name',
        ),
      ).to.equal('test_module | test_name');
    });

    it('does not add partition number to test name when `split` and `partition` are passed', function () {
      expect(
        TestemOutput.updateTestName(
          new Map()
            .set('split', 2)
            .set('partition', 2)
            .set('preserveTestName', true),
          'test_module | test_name',
        ),
      ).to.equal('test_module | test_name');
    });
  });

  describe('`preserveTestName` is not passed', function () {
    it('adds partition number to test name when `split` is passed', function () {
      expect(
        TestemOutput.updateTestName(
          new Map().set('split', 2),
          'test_module | test_name',
        ),
      ).to.equal('Exam Partition 1 - test_module | test_name');
    });

    it('adds partition number to test name when `split` and `partition` are passed', function () {
      expect(
        TestemOutput.updateTestName(
          new Map().set('split', 2).set('partition', 2),
          'test_module | test_name',
        ),
      ).to.equal('Exam Partition 2 - test_module | test_name');
    });
  });
});
