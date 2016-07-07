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
  'maxLength',
  'minLength',
  'pattern',
  'format',
  'enum'
]

/**
 * StringValidation
 * 3.1; 5.2
 */
class StringValidation extends Validation {

  /**
   * Type
   */
  type (pointer) {
    return `
    // VALIDATE TYPE
    if (value !== undefined && typeof value !== 'string') {
      validation.valid = false
      validation.errors.push({
        message: '"${pointer}" must be a string'
      })
    }
    `
  }

  /**
   * Max Length
   */
  maxLength (pointer) {
    let {schema:{maxLength,message}} = this

    if (maxLength) {
      return `
      // VALIDATE MAXLENGTH
      if (value.length > ${maxLength}) {
        validation.valid = false
        validation.errors.push({
          message: ${message} || '"${pointer}" is too long'
        })
      }
      `
    }
  }

  /**
   * Min Length
   */
  minLength (pointer) {
    let {schema:{minLength,message}} = this

    if (minLength) {
      return `
      // VALIDATE MINLENGTH
      if (value.length < ${minLength}) {
        validation.valid = false
        validation.errors.push({
          message: ${message} || '"${pointer}" is too short'
        })
      }
      `
    }
  }

  /**
   * Default value
   */
  defaultValue () {}

  /**
   * Pattern
   */
  pattern () {
    return ``
  }

  /**
   * Format
   */
  format () {
    return ``
  }

  /**
   * Compile
   */
  compile (pointer, required) {
    let {schema} = this

    let block = ''

    block += this.reference(pointer)

    // VALIDATE REQUIRED
    if (required) {
      block += this.required(pointer)
    }

    // VALIDATE TYPE
    block += this.type(pointer)

    // VALIDATE OTHER KEYWORDS
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
module.exports = StringValidation
