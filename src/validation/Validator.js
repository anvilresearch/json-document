'use strict'

/**
 * Dependencies
 * @ignore
 */
const Validation = require('./Validation')

/**
 * Mapping of JSON Schema types to code generation classes
 */
const TypeValidatorMapping = {
  'array': require('./ArrayValidation'),
  'boolean': require('./BooleanValidation'),
  'integer': require('./IntegerValidation'),
  'null': require('./NullValidation'),
  'number': require('./NumberValidation'),
  'object': require('./ObjectValidation'),
  'string': require('./StringValidation')
}

/**
 * Validator
 */
class Validator {

  /**
   * Compile
   */
  static compile (schema, required) {
    let type = Validation.determineType(schema)
    let validation = new TypeValidatorMapping[type](schema)

    let body = `
    let value
    let validation = { valid: true, errors: [] }
    ${validation.compile('', required)}
    return validation
    `

    return new Function('data', body)
  }
}

/**
 * Export
 */
module.exports = Validator
