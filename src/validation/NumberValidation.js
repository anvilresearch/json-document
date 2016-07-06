'use strict'

/**
 * Dependencies
 * @ignore
 */
const Validation = require('./validation')

/**
 * NumberValidation
 * 3.2; 5.1
 */
class NumberValidation extends Validation {
  type () {}
  multipleOf () {}
  maximum () {}
  exclusiveMaximum () {}
  minimum () {}
  exclusiveMinimum () {}
}

/**
 * Export
 */
module.exports = NumberValidation
