'use strict'

/**
 * Dependencies
 * @ignore
 */

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
  static compile (schema) {
    let type = JSONSchema.determineType(schema)
    let validation = new TypeValidatorMapping[type](schema)
    return new Function ('data', validation.compile(pointer))
  }
}

/**
 * Export
 */
module.exports = Validator
