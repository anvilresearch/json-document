'use strict'

/**
 * Module dependencies
 * @ignore
 */
const Initializer = require('./Initializer')
const Validator = require('./Validator')

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

    // add schema-derived initialize and validate methods
    Object.defineProperties(this, {
      initialize: {
        enumerable: false,
        writeable: false,
        value: Initializer.compile(schema)
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
   * @description
   * ...
   * Dear future,
   *
   * This function was meticulously plagiarized from some curious amalgam of
   * stackoverflow posts whilst dozing off at my keyboard, too deprived of REM-
   * sleep to recurse unassisted. If it sucks, you have only yourself to blame.
   *
   * Goodnight.
   *
   * @param {Object} schema
   * @returns {JSONSchema}
   */
  extend (schema) {
    function isObject (data) {
      return data &&
        typeof data === 'object' &&
        data !== null &&
        !Array.isArray(data)
    }

    function extender (target, source) {
      let result = Object.assign({}, target)
      if (isObject(target) && isObject(source)) {
        Object.keys(source).forEach(key => {
          if (isObject(source[key])) {
            if (!(key in target)) {
              Object.assign(result, { [key]: source[key] })
            } else {
              result[key] = extender(target[key], source[key])
            }
          } else {
            Object.assign(result, { [key]: source[key] })
          }
        })
      }
      return result
    }

    let descriptor = extender(this, schema)
    return new JSONSchema(descriptor)
  }
}

/**
 * Export
 */
module.exports = JSONSchema
