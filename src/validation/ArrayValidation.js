'use strict'

/**
 * Dependencies
 * @ignore
 */
const Validation = require('./Validation')

/**
 * Keywords
 * @ignore
 */
const KEYWORDS = [
  'additionalItems',
  'enum',
  'items',
  'maxItems',
  'minItems',
  'uniqueItems'
]

/**
 * ArrayValidation
 * 4.4; 5.3
 */
class ArrayValidation extends Validation {

  /**
   * Type
   */
  type (pointer) {
    return `
    if (value !== undefined && !Array.isArray(value)) {
      validation.valid = false
      validation.errors.push({
        message: '"${pointer}" must be an array'
      })
    }
    `
  }

  /**
   * Additional Items
   */
  additionalItems () {}

  /**
   * Items
   */
  items () {}

  /**
   * Max Items
   */
  maxItems () {}

  /**
   * Min Items
   */
  minItems () {}

  /**
   * Default Value
   */
  defaultValue () {}

  /**
   * Unique Items
   */
  uniqueItems () {}

  /**
   * Compile
   */
  compile (pointer, required) {
    let {schema} = this
    let block = ''

    block += this.reference(pointer)

    if (required) {
      block += this.required(pointer)
    }

    block += this.type(pointer)

    return block
  }
}

/**
 * Export
 */
module.exports = ArrayValidation
