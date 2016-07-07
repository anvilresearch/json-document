'use strict'

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
 * Validation
 *
 * @class
 * This is an abstract class for implementing type-specific validations.
 *
 * It encapsulates a reference to a subschema along with a pointer to it's
 * position relative to the root schema.
 *
 * It also provides methods for rendering validation code for generic
 * keywords. Additional methods for validating type-specific keywords
 * should be implemented by the subclass.
 *
 * An instance-level compile method should be implemented by the
 * subclass.
 */
class Validation {

  /**
   * Constructor
   */
  constructor (schema, pointer) {
    this.schema = schema
    this.pointer = pointer
  }

  /**
   * Reference
   */
  reference (pointer) {
    let chain = pointer && pointer.split('.')

    let block = `
    // ASSIGN
    value = data`

    chain && chain.forEach((token, index) => {
      let reference = `data.${ chain.slice(0, index).join('.') }`
      block += ` && ${reference}`
    })

    block += `
    `

    return block
  }

  /**
   * Required
   */
  required (pointer) {
    return `
    // VALIDATE REQUIRED
    if (value === undefined) {
      validation.valid = false
      validation.errors.push({
        message: '"${pointer}" is required'
      })
    } else
    `
  }

  /**
   * Enum
   */
  enum (pointer) {
    let {schema:{enum: enumerated}} = this

    return `
    // VALIDATE ENUM
    if (${JSON.stringify(enumerated)}.indexOf(value) === -1) {
      validation.valid = false
      validation.errors.push({
        message: value + ' is not an accepted value'
      })
    }
    `
  }

  /**
   * All Of
   */
  allOf () {}

  /**
   * Any Of
   */
  anyOf () {}

  /**
   * One Of
   */
  oneOf () {}

  /**
   * Not
   */
  not () {}

  /**
   * Definitions
   */
  definitions () {}

  /**
   * Compile
   */
  compile (schema, pointer) {
    throw new Error('compile must be implemented by subclasses')
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
module.exports = Validation
