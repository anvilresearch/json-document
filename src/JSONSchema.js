'use strict'

/**
 * Module dependencies
 */
const Initializer = require('./Initializer')
const Validator = require('./Validator')

/**
 * Types
 */
const TYPES = [
  'array',
  'boolean',
  'integer',
  'number',
  'null',
  'object',
  'string'
]

/**
 * JSONSchema
 *
 * @class
 * Compiles JSON Schema documents to an object with object initialization
 * and validation methods.
 */
class JSONSchema {

  /**
   * Constructor
   *
   * @param {Object} schema
   */
  constructor (schema) {
    // TODO: optionally parse JSON string?
    Object.assign(this, schema)

    let initializer = new Initializer(schema)
    initializer.parse()

    Object.defineProperties(this, {
      initialize: {
        enumerable: false,
        writeable: false,
        value: initializer.compile()
      },
      validate: {
        enumerable: false,
        writeable: false,
        value: Validator.compile(schema)
      }
    })
  }

  /**
   * Extend
   *
   * @param {Object} schema
   * @returns {JSONSchema}
   */
  extend (schema) {
    return new JSONSchema(Object.assign({}, this, schema))
  }
}

/**
 * Export
 */
module.exports = JSONSchema
