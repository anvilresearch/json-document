'use strict'

/**
 * Module dependencies
 */
const Initializer = require('./Initializer')

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
    // parse JSON string?
    let proto = this.constructor.prototype

    //let initializer = new Initializer(schema)
    //initializer.parse()
    //proto.initialize = initializer.compile()
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

  /**
   * Determine Type
   *
   * @description
   * Identifies or infers the type of a given schema
   *
   * @param {Object} schema
   * @returns {string}
   */
  static determineType (schema) {
    if (!schema.type) {
      // destructure keywords from schema for type inference
      // we don't need number/integer keywords because we can't
      // infer them
      let {
        type, minLength, maxLength, pattern, minItems, maxItems, items,
        additionalItems, uniqueItems, properties, additionalProperties,
        required, minProperties, maxProperties, dependencies,
        patternProperties
      } = schema

      // check properties for indicators of the type
      let isObject = Boolean(
        properties ||
        patternProperties ||
        additionalProperties ||
        minProperties ||
        maxProperties ||
        dependencies ||
        // this last one will not work if we extend JSON Schema to allow
        // `required` directly on non-object schemas
        required
      )

      let isArray = Boolean(
        minItems ||
        maxItems ||
        items ||
        uniqueItems
      )

      let isString = Boolean(
        minLength ||
        maxLength ||
        pattern
      )

      // If multiple types can be inferred, let the order of preference
      // be "object", then "array", then "string".
      //
      // "null" and "boolean" cannot be inferred because they have no
      // type-specific keywords
      //
      // "number" and "integer" cannot be inferred because they have
      // ambiguous keywords
      if (isObject) {
        schema.type = 'object'
      } else if (isArray) {
        schema.type = 'array'
      } else if (isString) {
        schema.type = 'string'
      } else {
        throw new Error('Invalid schema definition')
      }
    }

    else if (TYPES.indexOf(schema.type) === -1) {
      throw new Error(`Can't determine type of ${JSON.stringify(schema)}`)
    }

    return schema.type
  }
}

/**
 * Export
 */
module.exports = JSONSchema
