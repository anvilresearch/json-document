'use strict'

/**
 * Dependencies
 * @ignore
 */
const Validation = require('./validation')

/**
 * NullValidation
 */
class NullValidation extends Validation {

  /**
   * Type
   */
  type (pointer) {
    return `
    if (value !== undefined && value !== null) {
      validation.valid = false
      validation.errors.push({
        message: '"${pointer}" must be null'
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
module.exports = NullValidation
