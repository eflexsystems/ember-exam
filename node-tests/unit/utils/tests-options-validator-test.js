'use strict';

const assert = require('assert');
const TestOptionsValidator = require('../../../lib/utils/tests-options-validator');

describe('TestOptionsValidator', function () {
  function validateCommand(validator, cmd) {
    switch (cmd) {
      case 'Split':
        return validator.validateSplit();
      case 'Random':
        return validator.validateRandom();
      case 'Parallel':
        return validator.validateParallel();
      default:
        throw new Error('invalid command passed');
    }
  }

  function shouldThrow(cmd, options, message, emberCliVer = '3.7.0') {
    const validator = new TestOptionsValidator(options, emberCliVer);
    assert.throws(() => validateCommand(validator, cmd), message);
  }

  function shouldEqual(cmd, options, value, emberCliVer = '3.7.0') {
    const validator = new TestOptionsValidator(options, emberCliVer);
    assert.strictEqual(validateCommand(validator, cmd), value);
  }

  function shouldWarn(cmd, options, value, emberCliVer = '3.7.0') {
    /* eslint-disable no-console */
    let originalWarn = console.warn;
    let warnCalled = 0;
    let warnMessage = '';
    console.warn = function (message) {
      warnCalled++;
      warnMessage = message;
    };

    const validator = new TestOptionsValidator(options, emberCliVer);
    assert.notEqual(validateCommand(validator, cmd), undefined);
    assert.strictEqual(warnCalled, 1);
    assert.strictEqual(warnMessage, value);

    console.warn = originalWarn;
    /* eslint-enable no-console */
  }

  describe('shouldSplit', function () {
    function shouldSplitThrows(options, message) {
      shouldThrow('Split', options, message);
    }

    function shouldSplitEqual(options, message) {
      shouldEqual('Split', options, message);
    }

    it('should log a warning if `split` is less than 2', function () {
      shouldWarn(
        'Split',
        { split: 1 },
        'You should specify a number of files greater than 1 to split your tests across. Defaulting to 1 split which is the same as not using `split`.',
      );
    });

    it('should throw an error if `partition` is used without `split`', function () {
      shouldSplitThrows(
        { partition: [1] },
        /You must specify a `split` value in order to use `partition`/,
      );
    });

    it('should throw an error if `partition` contains a value less than 1', function () {
      shouldSplitThrows(
        { split: 2, partition: [1, 0] },
        /Split tests are one-indexed, so you must specify partition values greater than or equal to 1./,
      );
    });

    it('should throw an error if `partition` contains a value greater than `split`', function () {
      shouldSplitThrows(
        { split: 2, partition: [1, 3] },
        /You must specify `partition` values that are less than or equal to your `split` value./,
      );
    });

    it('should throw an error if `partition` contains duplicate values', function () {
      shouldSplitThrows(
        { split: 2, partition: [1, 2, 1] },
        /You cannot specify the same partition value twice. 1 is repeated./,
      );
    });

    it('should return true if using `split`', function () {
      shouldSplitEqual({ split: 2 }, true);
    });

    it('should return true if using `split` and `partition`', function () {
      shouldSplitEqual({ split: 2, partition: [1] }, true);
    });

    it('should return false if not using `split`', function () {
      shouldSplitEqual({}, false);
    });
  });

  describe('shouldRandomize', function () {
    function shouldRandomizeEqual(options, message) {
      shouldEqual('Random', options, message);
    }

    it('should return true if `random` is an empty string', function () {
      shouldRandomizeEqual({ random: '' }, true);
    });

    it('should return true if `random` is set to a string', function () {
      shouldRandomizeEqual({ random: '1337' }, true);
    });

    it('should return false if `random` is a non-string', function () {
      shouldRandomizeEqual({ random: true }, false);
    });

    it('should return false if `random` is not used', function () {
      shouldRandomizeEqual({}, false);
    });
  });

  describe('shouldParallelize', function () {
    it('should throw an error if `parallel` is not a numeric value', function () {
      shouldThrow(
        'Parallel',
        { parallel: '--reporter' },
        /EmberExam: You must specify a Numeric value to 'parallel'. Value passed: --reporter/,
      );
    });

    it('should throw an error if `split` is not being used', function () {
      shouldThrow(
        'Parallel',
        { parallel: 1 },
        /You must specify the `split` option in order to run your tests in parallel/,
      );
    });

    it('should throw an error if used with `replay-browser`', function () {
      shouldThrow(
        'Parallel',
        { replayBrowser: 2, parallel: 1 },
        /You must not use the `replay-browser` option with the `parallel` option./,
      );
    });

    it('should throw an error if parallel is > 1 when used with `split`', function () {
      shouldThrow(
        'Parallel',
        { split: 2, parallel: 2 },
        /When used with `split` or `partition`, `parallel` does not accept a value other than 1./,
      );
    });

    it('should return true', function () {
      shouldEqual('Parallel', { split: 2, parallel: 1 }, true);
    });
  });
});
