'use strict'

/**
 * Dependencies
 * @ignore
 */
const Validation = require('./validation')

/**
 * StringValidation
 * 3.1; 5.2
 */
class StringValidation extends Validation {

  /**
   * Type
   */
  type () {
    return `
    if (typeof ${this.ref} !== 'string') {
      errors.push({ message: '${this.ref} must be a string' })
    }
    `
  }

  /**
   * Max Length
   */
  maxLength () {
    let {operation:{maxLength,message}} = this

    if (maxLength) {
      return `
      if (${this.ref}.length > ${maxLength}) {
        errors.push({ message })
      }
      `
    }
  }

  /**
   * Etc
   */
  minLength () {}
  defaultValue () {}
  pattern () {}
  format () {}

  /**
   * compile
   */
  compile (pointer) {
    let validations = [
      'type',
      'maxLength',
      'minLength',
      'pattern',
      'format',
      'enum'
    ]

    return `

    // string validation for ${this.ref}
    if (data.${this.ref}) { // we need to deal with null guards for nested objects
    ${validations.map(validation => this[validation]()).filter(block => !!block).join()}
    }
    `
  }
}

/**
 * Export
 */
module.exports = StringValidation
