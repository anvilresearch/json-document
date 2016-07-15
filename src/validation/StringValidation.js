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
  'maxLength',
  'minLength',
  'pattern',
  'format',
  'enum'
]

/**
 * Formats
 */
const FORMATS = {
  'date-time': /^\d\d\d\d-[0-1]\d-[0-3]\d[t\s][0-2]\d:[0-5]\d:[0-5]\d(?:\.\d+)?(?:z|[+-]\d\d:\d\d)$/i,
  'uri': /^(?:[a-z][a-z0-9+-.]*)?(?:\:|\/)\/?[^\s]*$/i,
  'email': /^[a-z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)*$/i,
  'ipv4': /^(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)$/,
  'ipv6': /^\s*(?:(?:(?:[0-9a-f]{1,4}:){7}(?:[0-9a-f]{1,4}|:))|(?:(?:[0-9a-f]{1,4}:){6}(?::[0-9a-f]{1,4}|(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(?:(?:[0-9a-f]{1,4}:){5}(?:(?:(?::[0-9a-f]{1,4}){1,2})|:(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(?:(?:[0-9a-f]{1,4}:){4}(?:(?:(?::[0-9a-f]{1,4}){1,3})|(?:(?::[0-9a-f]{1,4})?:(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(?:(?:[0-9a-f]{1,4}:){3}(?:(?:(?::[0-9a-f]{1,4}){1,4})|(?:(?::[0-9a-f]{1,4}){0,2}:(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(?:(?:[0-9a-f]{1,4}:){2}(?:(?:(?::[0-9a-f]{1,4}){1,5})|(?:(?::[0-9a-f]{1,4}){0,3}:(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(?:(?:[0-9a-f]{1,4}:){1}(?:(?:(?::[0-9a-f]{1,4}){1,6})|(?:(?::[0-9a-f]{1,4}){0,4}:(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(?::(?:(?:(?::[0-9a-f]{1,4}){1,7})|(?:(?::[0-9a-f]{1,4}){0,5}:(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))(?:%.+)?\s*$/i,
  'hostname': /^[a-z](?:(?:[-0-9a-z]{0,61})?[0-9a-z])?(\.[a-z](?:(?:[-0-9a-z]{0,61})?[0-9a-z])?)*$/i,

}

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
      if (Array.from(value).length > ${maxLength}) {
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
      if (Array.from(value).length < ${minLength}) {
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
  pattern (pointer) {
    let {schema:{pattern,message}} = this

    if (pattern) {
      return `
      // VALIDATE PATTERN
      if (!value.match(new RegExp('${pattern}'))) {
        validation.valid = false
        validation.errors.push({
          message: ${message} || '"${pointer}" does not match the required pattern'
        })
      }
      `
    }
  }

  /**
   * Format
   */
  format (pointer) {
    let {schema:{format}} = this
    let matcher = FORMATS[format]

    if (matcher) {
      return `
      if (!value.match(${matcher})) {
        validation.valid = false
        validation.errors.push({
          message: '"${pointer}" is not "${format}" format'
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
