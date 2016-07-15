'use strict'

/**
 * Dependencies
 * @ignore
 */
const Validation = require('./validation')

/**
 * Mapping of JSON Schema types to code generation classes
 *
 * @todo
 * This is a duplication of what's in the Validator class. We need a good place
 * for this mapping to live
 */
const TypeValidatorMapping = {
  'array': require('./ArrayValidation'),
  'boolean': require('./BooleanValidation'),
  'integer': require('./IntegerValidation'),
  'null': require('./NullValidation'),
  'number': require('./NumberValidation'),
  'string': require('./StringValidation')
}

/**
 * Keywords
 * @ignore
 */
const KEYWORDS = [
  'maxProperties',
  //'minProperties',
  //'required',
  //'additionalProperties',
  'properties',
  //'patternProperties',
  //'dependencies',
  //'schemaDependencies',
  //'propertyDependencies'
]

/**
 * ObjectValidation
 * 3.3; 4.4; 5.4
 */
class ObjectValidation extends Validation {

  /**
   * Type
   */
  type (pointer) {
    return `
    // VALIDATE TYPE
    if (
      value !== undefined && (
        typeof value !== 'object' ||
        Array.isArray(value) ||
        value === null
      )
    ) {
      validation.valid = false
      validation.errors.push({
        message: '"${pointer}" must be a object'
      })
    }
    `
  }

  /**
   * Max Properties
   */
  maxProperties (pointer) {
    let {schema:{maxProperties}} = this

    return `
    if (Object.keys(data).length > ${maxProperties}) {
      validation.valid = false
      validation.errors.push({
        message: '${pointer} has too many properties'
      })
    }
    `
  }

  /**
   * Min Properties
   */
  minProperties (pointer) {}

  /**
   * Default Value
   */
  defaultValue (pointer) {}

  /**
   * Required
   */
  //required (pointer) {}

  /**
   * Additional Properties
   */
  additionalProperties (pointer) {}

  /**
   * Properties
   */
  properties (pointer) {
    let {schema:{properties}} = this
    let block = `
    // properties
    `

    if (properties) {
      Object.keys(properties).forEach(key => {
        let subschema = properties[key]
        let type = Validation.determineType(subschema)

        // This bit of weirdness is about avoiding circular dependency
        // of this module
        let validation = new (
          TypeValidatorMapping[type] ||
          ObjectValidation
        )(subschema)

        let subpointer = (pointer) ? `${pointer}.${key}` : key

        block += validation.compile(subpointer, true)
      })
    }

    return block
  }

  /**
   * Pattern Properties
   */
  patternProperties (pointer) {}

  /**
   * Dependencies
   */
  dependencies (pointer) {}

  /**
   * Schema Dependencies
   */
  schemaDependencies (pointer) {}

  /**
   * Property Dependencies
   */
  propertyDependencies (pointer) {}

  /**
   * Compile
   */
  compile (pointer, required) {
    let {schema} = this

    let block = ''

    block += this.reference(pointer)

    if (required) {
      block += this.required(pointer)
    }

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
module.exports = ObjectValidation
