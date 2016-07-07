'use strict'

/**
 * Dependencies
 * @ignore
 */
const NumberValidation = require('./NumberValidation')

/**
 * IntegerValidation
 */
class IntegerValidation extends NumberValidation {

  /**
   * Type
   */
  type (pointer) {
    return `
    if (value !== undefined && !Number.isInteger(value)) {
      validation.valid = false
      validation.errors.push({
        message: '"${pointer}" must be an integer'
      })
    }
    `
  }
}

/**
 * Export
 */
module.exports = IntegerValidation
