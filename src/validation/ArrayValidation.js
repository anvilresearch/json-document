'use strict'

/**
 * Dependencies
 * @ignore
 */
const Validation = require('./Validation')

/**
 * ArrayValidation
 * 4.4; 5.3
 */
class ArrayValidation extends Validation {
  type () {}
  additionalItems () {}
  items () {}
  maxItems () {}
  minItems () {}
  defaultValue () {}
  uniqueItems () {}
}

/**
 * Export
 */
module.exports = ArrayValidation
