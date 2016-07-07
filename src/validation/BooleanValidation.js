'use strict'

/**
 * Dependencies
 * @ignore
 */
const Validation = require('./validation')

/**
 * BooleanValidation
 */
class BooleanValidation extends Validation {

  /**
   * Type
   */
  type (pointer) {
    return `
    if (value !== undefined && typeof value !== 'boolean') {
      validation.valid = false
      validation.errors.push({
        message: '"${pointer}" must be boolean'
      })
    }
    `
  }

  /**
   * Compile
   */
  compile (pointer, required) {
    let block = ''
    block += this.reference(pointer)
    if (required) { block += this.required(pointer) }
    block += this.type(pointer)
    return block
  }
}

/**
 * Export
 */
module.exports = BooleanValidation
