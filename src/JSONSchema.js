'use strict'

/**
 * Module dependencies
 */
const Initializer = require('./Initializer')

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
    // parse JSON string?
    let proto = this.constructor.prototype

    let initializer = new Initializer(schema)
    initializer.parse()
    proto.initialize = initializer.compile()
    // proto.validate = Validator.compile(schema)
    Object.assign(this, schema)
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
