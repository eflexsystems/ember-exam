'use strict';

const SilentError = require('silent-error');

/**
 * Validates the specified partitions
 *
 * @private
 * @param {Array<Number>} partitions
 * @param {Number} split
 */
function validatePartitions(partitions, split) {
  validatePartitionSplit(partitions, split);
  validateElementsUnique(partitions, 'partition');
}

/**
 * Determines if the specified partitions value makes sense for a given split.
 *
 * @private
 * @param {Array<Number>} partitions
 * @param {Number} split
 */
function validatePartitionSplit(partitions, split) {
  if (!split) {
    throw new SilentError(
      'EmberExam: You must specify a `split` value in order to use `partition`.',
    );
  }

  for (let i = 0; i < partitions.length; i++) {
    const partition = partitions[i];
    if (partition < 1) {
      throw new SilentError(
        'EmberExam: Split tests are one-indexed, so you must specify partition values greater than or equal to 1.',
      );
    }
    if (partition > split) {
      throw new SilentError(
        'EmberExam: You must specify `partition` values that are less than or equal to your `split` value.',
      );
    }
  }
}

/**
 * Ensures that there is no value duplicated in a given array.
 *
 * @private
 * @param {Array} arr
 * @param {String} typeOfValue
 */
function validateElementsUnique(arr, typeOfValue) {
  const sorted = arr.slice().sort();
  for (let i = 0; i < sorted.length - 1; i++) {
    if (sorted[i] === sorted[i + 1]) {
      const errorMsg = `EmberExam: You cannot specify the same ${typeOfValue} value twice. ${sorted[i]} is repeated.`;
      throw new SilentError(errorMsg);
    }
  }
}

/**
 * Performs logic related to validating command options for testing and
 * determining which functions to run on the tests.
 *
 * @class TestsOptionsValidator
 */
module.exports = class TestsOptionsValidator {
  constructor(options, emberCliVersion) {
    this.options = options;
    this.emberCliVersion = emberCliVersion;
  }

  /**
   * Validates the command and returns a map of the options and whether they are enabled or not.
   *
   * @public
   * @return {Object} Map of the options and whether they are enabled or not.
   */
  validateCommands() {
    const validatedOptions = new Map();
    if (this.options.writeModuleMetadataFile) {
      validatedOptions.set('writeModuleMetadataFile', true);
    }

    if (this.options.split || this.options.partition) {
      validatedOptions.set('split', this.validateSplit());
    }

    // The parallel option accepts a number, which can be 0
    if (typeof this.options.parallel !== 'undefined') {
      validatedOptions.set('parallel', this.validateParallel());
    }

    // As random option can be an empty string it should check a type of random option rather than the option is not empty.
    if (typeof this.options.random !== 'undefined') {
      validatedOptions.set('random', this.validateRandom());
    }

    return validatedOptions;
  }

  /**
   * Determines if we should split the tests file and validates associated options
   * (`split`, `partition`).
   *
   * @return {boolean}
   */
  validateSplit() {
    const options = this.options;
    let split = options.split;

    if (typeof split !== 'undefined' && split < 2) {
      // eslint-disable-next-line no-console
      console.warn(
        'You should specify a number of files greater than 1 to split your tests across. Defaulting to 1 split which is the same as not using `split`.',
      );
      split = 1;
    }

    const partitions = options.partition;

    if (typeof partitions !== 'undefined') {
      validatePartitions(partitions, split);
    }

    return !!split;
  }

  /**
   * Determines if we should randomize the tests and validates associated options
   * (`random`).
   *
   * @return {boolean}
   */
  validateRandom() {
    return typeof this.options.random === 'string';
  }

  /**
   * Determines if we should run split tests in parallel and validates associated
   * options (`parallel`).
   *
   * @return {boolean}
   */
  validateParallel() {
    const parallelValue = parseInt(this.options.parallel, 10);

    if (isNaN(parallelValue)) {
      throw new SilentError(
        `EmberExam: You must specify a Numeric value to 'parallel'. Value passed: ${this.options.parallel}`,
      );
    }
    this.options.parallel = parallelValue;

    if (!this.options.split) {
      throw new SilentError(
        'EmberExam: You must specify the `split` option in order to run your tests in parallel.',
      );
    } else if (this.options.parallel !== 1) {
      throw new SilentError(
        'EmberExam: When used with `split` or `partition`, `parallel` does not accept a value other than 1.',
      );
    }

    if (this.options.parallel < 1) {
      throw new SilentError(
        'EmberExam: You must specify a value greater than 1 to `parallel`.',
      );
    }

    return true;
  }
};
