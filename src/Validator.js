
/**
 * Formats
 */
const FORMATS = {
  'date-time': /^\d\d\d\d-[0-1]\d-[0-3]\d[t\s][0-2]\d:[0-5]\d:[0-5]\d(?:\.\d+)?(?:z|[+-]\d\d:\d\d)$/i,

  'uri': /^(?:[a-z][a-z0-9+-.]*)?(?:\:|\/)\/?[^\s]*$/i,

  'email': /^[a-z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)*$/i,

  'ipv4': /^(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)$/,

  'ipv6': /^\s*(?:(?:(?:[0-9a-f]{1,4}:){7}(?:[0-9a-f]{1,4}|:))|(?:(?:[0-9a-f]{1,4}:){6}(?::[0-9a-f]{1,4}|(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(?:(?:[0-9a-f]{1,4}:){5}(?:(?:(?::[0-9a-f]{1,4}){1,2})|:(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(?:(?:[0-9a-f]{1,4}:){4}(?:(?:(?::[0-9a-f]{1,4}){1,3})|(?:(?::[0-9a-f]{1,4})?:(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(?:(?:[0-9a-f]{1,4}:){3}(?:(?:(?::[0-9a-f]{1,4}){1,4})|(?:(?::[0-9a-f]{1,4}){0,2}:(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(?:(?:[0-9a-f]{1,4}:){2}(?:(?:(?::[0-9a-f]{1,4}){1,5})|(?:(?::[0-9a-f]{1,4}){0,3}:(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(?:(?:[0-9a-f]{1,4}:){1}(?:(?:(?::[0-9a-f]{1,4}){1,6})|(?:(?::[0-9a-f]{1,4}){0,4}:(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(?::(?:(?:(?::[0-9a-f]{1,4}){1,7})|(?:(?::[0-9a-f]{1,4}){0,5}:(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))(?:%.+)?\s*$/i,

  'hostname': /^[a-z](?:(?:[-0-9a-z]{0,61})?[0-9a-z])?(\.[a-z](?:(?:[-0-9a-z]{0,61})?[0-9a-z])?)*$/i,

}

/**
 * Validator
 *
 * Compile an object describing a JSON Schema into a validation function.
 */
class Validator {

  /**
   * Compile (static)
   *
   * @description
   * Compile an object describing a JSON Schema into a validation function.
   *
   * @param {Object} schema
   * @returns {Function}
   */
  static compile (schema) {
    let validator = new Validator(schema)

    let body = `
      let value
      let valid = true
      let errors = []
      ${ validator.compile() }
      return { valid, errors }
    `

    console.log(body)
    return new Function('data', body)
  }

  /**
   * Constructor
   *
   * @param {Object} schema - object representation of a schema
   * @param {string} address - reference to ancestry of schema param
   */
  constructor (schema, address) {
    this.schema = schema
    this.address = address
  }

  /**
   * Compile
   *
   * @description
   * The instance compile method is "dumb". It only sequences invocation of more
   * specific compilation methods. It generates code to
   *
   *  - reference a value from input
   *  - validate type(s) of input
   *  - validate constraints described by various schema keywords
   *
   * Conditional logic related to code generation is pushed downsteam to type-
   * specific methods.
   */
  compile (required) {
    let block = ``

    block += this.reference()

    if (required) {
      block += this.required()
    }

    // type validation
    block += this.type()

    // type specific validation generators
    // null and boolean are covered by this.type()
    // integer should be covered by number and this.type()
    block += this.array()
    block += this.number()
    block += this.object()
    block += this.string()

    return block
  }

  /**
   * Reference
   */
  reference () {
    let {address} = this
    let chain = address && address.split('.')

    let block = `
      // NEXT VALUE
      value = data `

    chain && chain.forEach((token, index) => {
      let reference = `data.${ chain.slice(0, index + 1).join('.') }`
      block += `&& ${reference}`
    })

    block += `
    `

    return block
  }

  /**
   * Type
   *
   * @description
   * Generate code to validate type(s) of input values
   */
  type () {
    let {schema:{type}} = this
    let block = ``

    if (type) {
      let types = (Array.isArray(type)) ? type : [type]
      let conditions = types.map(type => {
        // TODO: can we make a mapping object for this to clean it up?
        if (type === 'array') return `!Array.isArray(value)`
        if (type === 'boolean') return `typeof value !== 'boolean'`
        if (type === 'integer') return `!Number.isInteger(value)`
        if (type === 'null') return `value !== null`
        if (type === 'number') return `typeof value !== 'number'`
        if (type === 'object') return `(typeof value !== 'object' || Array.isArray(value) || value === null)`
        if (type === 'string') return `typeof value !== 'string'`
      }).join(' && ')

      block += `
      // type checking
      if (value !== undefined && ${conditions}) {
        valid = false
        errors.push({ message: 'invalid type' })
        return { valid, errors }
      }
      `
    }

    return block
  }

  /**
   * Array
   */
  array () {
    let keywords = [
      'additionalItems', 'items', 'minItems', 'maxItems', 'uniqueItems', 'enum'
    ]
    let validations = this.validations(keywords)
    let block = ``

    if (validations.length > 0) {
      block += `
      // array validations
      if (Array.isArray(value)) {
      ${validations}
      }
      `
    }

    return block
  }

  /**
   * Number
   */
  number () {
    let keywords = ['minimum', 'maximum', 'multipleOf', 'enum']
    let validations = this.validations(keywords)
    let block = ``

    if (validations.length > 0) {
      block += `
      // number validations
      if (typeof value === 'number') {
      ${validations}
      }
      `
    }

    return block
  }

  /**
   * Object
   */
  object () {
    let keywords = [
      'maxProperties', 'minProperties', 'additionalProperties',
      'properties', 'patternProperties', 'dependencies', 'schemaDependencies',
      'propertyDependencies', 'enum'
    ]
    let validations = this.validations(keywords)
    let block = ``

    if (validations.length > 0) {
      block += `
      // object validations
      if (typeof value === 'object' && value !== null) {
      ${validations}
      }
      `
    }

    return block
  }

  /**
   * String
   *
   * @description
   * String-specific validation code generation
   */
  string () {
    let keywords = ['maxLength', 'minLength', 'pattern', 'format', 'enum']
    let validations = this.validations(keywords)
    let block = ``

    if (validations.length > 0) {
      block += `
      // string validations
      if (typeof value === 'string') {
      ${validations}
      }
      `
    }

    return block
  }

  /**
   * Validations
   *
   * @description
   * Iterate over keywords and invoke code generator methods for each.
   * Concatenate the results together and return. Used by "type" methods
   * such as this.array() and this.string()
   *
   * @param {Array} keywords
   * @returns string
   */
  validations (keywords) {
    let {schema} = this
    let block = ``

    let constraints = Object.keys(schema).filter(key => {
      return keywords.indexOf(key) !== -1
    })

    constraints.forEach(keyword => {
      block += this[keyword]()
    })

    return block
  }

  /**
   * Generic Validations
   */

  /**
   * Enum
   */
  enum () {
    let {schema:{enum: enumerated}} = this
    let block = ``

    if (enumerated) {
      block += `
      // validate enum
      if (${JSON.stringify(enumerated)}.indexOf(value) === -1) {
        valid = false
        errors.push({ message: value + ' is not an accepted value' })
      }
      `
    }

    return block
  }

  /**
   * anyOf
   */
  anyOf () {
    return ``
  }

  /**
   * allOf
   */
  allOf () {
    return ``
  }

  /**
   * oneOf
   */
  oneOf () {
    return ``
  }

  /**
   * Not
   */
  not () {
    return ``
  }

  /**
   * Definitions
   */
  definitions () {
    return ``
  }

  /**
   * Object Validations
   */

  /**
   * Properties
   */
  properties () {
    let {schema} = this
    let {properties,required} = schema
    let block = ``

    // ensure the value of "required" schema property is an array
    required = (Array.isArray(required) ? required : [])

    if (typeof properties === 'object') {
      Object.keys(properties).forEach(key => {
        let subschema = properties[key]
        let isRequired = required.indexOf(key) !== -1
        let validation = new Validator(subschema, key)
        block += validation.compile(isRequired)
      })
    }

    return block
  }

  /**
   * patternProperties
   */
  patternProperties () {
    let {schema} = this
    let {patternProperties} = schema
    let block = ``

    if (typeof patternProperties === 'object') {
      Object.keys(patternProperties).forEach(key => {
        // TODO
        // how do we make validation code that will apply to matching property names
        // that are unknown before-hand?
      })
    }

    return block
  }

  /**
   * additionalProperties
   */
  additionalProperties () {
    let {schema} = this
    let {properties,additionalProperties} = schema
    let block = ``

    let knownProperties = Object.keys(properties).map(key => {
      return `key !== '${key}'`
    })

    let conditions = [
      'data.hasOwnProperty(key)'
    ].concat(knownProperties).join(' && ')

    if (additionalProperties) {
      block += `
      // additionalProperties
      for (let key in data) {
        if (${conditions}) {
          // we need to reference, check type, and apply other validations
          // works differently that these others because we don't know in
          // advance what the keys are to reference
          value = data[key]

          // how to get type?
          // is there some way we can create a new compiler for a generalized ref?
          //
          // TODO Feels like this needs talking through
        }
      }
      `
    }


    return block
  }

  /**
   * minProperties
   */
  minProperties () {
    let {schema:{minProperties}} = this

    return `
        // min properties
        if (Object.keys(value).length < ${minProperties}) {
          valid = false
          errors.push({
            message: 'too few properties'
          })
        }
    `
  }

  /**
   * maxProperties
   */
  maxProperties () {
    let {schema:{maxProperties}} = this

    return `
        // max properties
        if (Object.keys(value).length > ${maxProperties}) {
          valid = false
          errors.push({
            message: 'too many properties'
          })
        }
    `
  }

  /**
   * Dependencies
   */
  dependencies () {
    return ``
  }

  /**
   * Required
   */
  required () {
    let {schema:{properties}} = this
    let block = ``

    block += `
      // validate presence
      if (value === undefined) {
        valid = false
        errors.push({ message: 'is required' })
      }
    `

    return block
  }

  /**
   * Array Validations
   */
  additionalItems () {
    let {schema:{items,additionalItems}} = this
    let block = ``

    if (additionalItems === false && Array.isArray(items)) {
      block += `
        // don't allow additional items
        if (value.length > ${items.length}) {
          valid = false
          errors.push({ message: 'additional items not allowed' })
        }
      `
    }

    if (Array.isArray(items)) {
      block += `
        // additional items
        for (var i = ${items.length}; i < value.length; i++) {
          // TODO
          // create a new validation object and recusrse
          // we'll need to modify this.reference() to accommodate arrays
          // and deal with restoring the referece to parent for subsequent
          // validations of that property
        }
      `
    }

    return block
  }

  /**
   * Items
   */
  items () {
    return ``
  }

  /**
   * minItems
   */
  minItems () {
    let {schema:{minItems}} = this

    return `
        // min items
        if (value.length < ${minItems}) {
          valid = false
          errors.push({
            message: 'too few properties'
          })
        }
    `
  }

  /**
   * maxItems
   */
  maxItems () {
    let {schema:{maxItems}} = this

    return `
        // max items
        if (value.length > ${maxItems}) {
          valid = false
          errors.push({ message: 'too many properties' })
        }
    `
  }

  /**
   * uniqueItems
   *
   * TODO
   * optimize
   */
  uniqueItems () {
    let {schema:{uniqueItems}} = this
    let block = ``

    if (uniqueItems === true) {
      block += `
        // validate unique items
        let values = value.map(v => JSON.stringify(v)) // TODO: optimize
        let set = new Set(values)
        if (values.length !== set.size) {
          valid = false
          errors.push({ message: 'items must be unique' })
        }
      `
    }

    return block
  }

  /**
   * String Validations
   */

  /**
   * minLength
   */
  minLength () {
    let {schema:{minLength}} = this

    return `
        // validate minLength
        if (Array.from(value).length < ${minLength}) {
          valid = false
          errors.push({ message: 'too short' })
        }
    `
  }

  /**
   * maxLength
   */
  maxLength () {
    let {schema:{maxLength}} = this

    return `
        // validate maxLength
        if (Array.from(value).length > ${maxLength}) {
          valid = false
          errors.push({ message: 'too long' })
        }
    `
  }

  /**
   * Pattern
   */
  pattern () {
    let {schema:{pattern}} = this

    if (pattern) {
      return `
          // validate pattern
          if (!value.match(new RegExp('${pattern}'))) {
            valid = false
            errors.push({ message: 'does not match the required pattern' })
          }
      `
    }
  }

  /**
   * Format
   */
  format () {
    let {schema:{format}} = this
    let matcher = FORMATS[format]

    if (matcher) {
      return `
      if (!value.match(${matcher})) {
        valid = false
        errors.push({ message: 'is not "${format}" format' })
      }
      `
    }
  }

  /**
   * Number|Integer Validations
   */

  /**
   * Minimum
   */
  minimum () {
    let {schema:{minimum,exclusiveMinimum}} = this
    let operator = exclusiveMinimum === true ? '<=' : '<'

    return `
        if (value ${operator} ${minimum}) {
          valid = false
          errors.push({ message: 'too small' })
        }
    `
  }

  /**
   * Maximum
   */
  maximum () {
    let {schema:{maximum,exclusiveMaximum}} = this
    let operator = exclusiveMaximum === true ? '>=' : '>'

    return `
        if (value ${operator} ${maximum}) {
          valid = false
          errors.push({ message: 'too large' })
        }
    `
  }

  /**
   * multipleOf
   */
  multipleOf () {
    let {schema:{multipleOf}} = this

    return `
        if (value % ${multipleOf} !== 0) {
          valid = false
          errors.push({ message: 'must be a multiple of ${multipleOf}' })
        }
    `
  }
}

module.exports = Validator
