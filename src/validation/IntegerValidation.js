'use strict'

/**
 * Dependencies
 * @ignore
 */
const Validation = require('./validation')

/**
 * IntegerValidation
 */
class IntegerValidation extends Validation {
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
module.exports = IntegerValidation
