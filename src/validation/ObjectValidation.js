'use strict'

/**
 * Dependencies
 * @ignore
 */
const Validation = require('./validation')

/**
 * ObjectValidation
 * 3.3; 4.4; 5.4
 */
class ObjectValidation extends Validation {
  type () {}
  maxProperties () {}
  minProperties () {}
  defaultValue () {}
  required () {}
  additionalProperties () {}
  properties () {}
  patternProperties () {}
  dependencies () {}
  schemaDependencies () {}
  propertyDependencies () {}
  compile () {}
}

/**
 * Export
 */
module.exports = ObjectValidation
