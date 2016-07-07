'use strict'

/**
 * Dependencies
 * @ignore
 */
const Validation = require('./validation')

/**
 * Keywords
 * @ignore
 */
const KEYWORDS = [
  'enum',
  'exclusiveMaximum',
  'exclusiveMinimum',
  'maximum',
  'minimum',
  'multipleOf'
]

/**
 * NumberValidation
 * 3.2; 5.1
 */
class NumberValidation extends Validation {

  /**
   * Type
   */
  type (pointer) {
    return `
    if (value !== undefined && typeof value !== 'number') {
      validation.valid = false
      validation.errors.push({
        message: '"${pointer}" must be a number'
      })
    }
    `
  }

  /**
   * Multiple Of
   */
  multipleOf (pointer) {
    let {schema:{multipleOf}} = this

    if (multipleOf) {
      return `
      if (value % ${multipleOf} !== 0) {
        validation.valid = false
        validation.errors.push({
          message: '"${pointer}" must be a multiple of ${multipleOf}'
        })
      }
      `
    }
  }

  /**
   * Maximum
   */
  maximum (pointer) {
    let {schema:{maximum}} = this

    if (maximum) {
      return `
      if (value > ${maximum}) {
        validation.valid = false
        validation.errors.push({
          message: '"${pointer}" is too large'
        })
      }
      `
    }
  }

  /**
   * Exclusive Maximum
   */
  exclusiveMaximum (pointer) {
    let {schema:{exclusiveMaximum}} = this

    if (exclusiveMaximum) {
      return `
      if (value >= ${exclusiveMaximum}) {
        validation.valid = false
        validation.errors.push({
          message: '"${pointer}" is too large'
        })
      }
      `
    }
  }

  /**
   * Minimum
   */
  minimum (pointer) {
    let {schema:{minimum}} = this

    if (minimum) {
      return `
      if (value < ${minimum}) {
        validation.valid = false
        validation.errors.push({
          message: '"${pointer}" is too small'
        })
      }
      `
    }
  }

  /**
   * Exclusive Minimum
   */
  exclusiveMinimum (pointer) {
    let {schema:{exclusiveMinimum}} = this

    if (exclusiveMinimum) {
      return `
      if (value <= ${exclusiveMinimum}) {
        validation.valid = false
        validation.errors.push({
          message: '"${pointer}" is too small'
        })
      }
      `
    }
  }

  /**
   * Compile
   */
  compile (pointer, required) {
    let {schema} = this
    let block = ''

    block += this.reference(pointer)

    if (required) { block += this.required(pointer) }

    block += this.type(pointer)

    let others = Object.keys(schema).filter(keyword => {
      return KEYWORDS.indexOf(keyword) !== -1
    })

    if (others.length > 0) {
      block += `
      // OTHER VALIDATIONS
        else if (value !== undefined) {
      `

      others.forEach(keyword => {
        block += this[keyword](pointer)
      })

      block += `
      }
      `
    }

    return block
  }
}

/**
 * Export
 */
module.exports = NumberValidation
