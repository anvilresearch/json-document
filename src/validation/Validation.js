'use strict'

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

  enum () {}
  allOf () {}
  anyOf () {}
  oneOf () {}
  not () {}
  definitions () {}

  /**
   * Compile
   */
  compile (schema, pointer) {
    throw new Error('compile must be implemented by subclasses')
  }
}

/**
 * Export
 */
module.exports = Validation
