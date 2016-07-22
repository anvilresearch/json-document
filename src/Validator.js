
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
    let validator = new Validator(schema, '')

    let body = `
      let value
      let valid = true
      let errors = []
      let parent
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

    // non-type-specific validation generators
    block += this.enum()

    return block
  }

  /**
   * Reference
   */
  reference () {
    let {address} = this
    let block = ``

    // array index for iterated value
    if (address.match(/\[\?\]$/)) {
      block += `
        value = parent[i]
      `

    // explicit array index
    } else if (address.match(/\[[0-9]+\]/)) {
      let index = parseInt(address.match(/[0-9]+/)[0])
      block += `
        value = parent[${index}]
      `

    } else if (address.match(/^pattern\:/)) {
      block += `
        value = parent[key]
      `
    // ...
    } else {
      let chain = address && address.replace('[', '.').replace(']', '').split('.')
      let guards = ['data']

      chain && chain.forEach((token, index) => {
        guards.push(
          chain.slice(0, index + 1).reduce((result, segment) => {

            // array index in ancestry
            if (Number.isInteger(parseInt(segment))) {
              result += `[${segment}]`

            // object property reference in ancestry
            } else {
              result += `.${segment}`
            }

            return result
          }, 'data')
        )
      })

      block += `
        // NEXT VALUE
        value = ${guards.join(' && ')}
      `
    }

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
        errors.push({
          keyword: 'type',
          message: 'invalid type'
        })
        return { valid, errors }
      }
      `
    }

    return block
  }

  /**
   * Type-specific validations
   *
   * Type checking is optional in JSON Schema, and a schema can allow multiple
   * types. Generated code needs to apply type-specific validations only to
   * appropriate values, and ignore everything else. Type validation itself is
   * handled separately from other validation keywords.
   *
   * The methods `array`, `number`, `object`, `string` generate type-specific
   * validation code blocks, wrapped in a conditional such that they will only
   * be applied to values of that type.
   *
   * For example, the `number` method, given the schema
   *
   *     { minimum: 3 }
   *
   * will generate
   *
   *     if (typeof value === 'number') {
   *       if (value < 3) {
   *         valid = false
   *         errors.push({ message: '...' })
   *       }
   *     }
   *
   * Integer values are also numbers, and are validated the same as numbers
   * other than the type validation itself. Therefore no `integer` method is
   * needed.
   */

  /**
   * Array
   */
  array () {
    let keywords = [
      'additionalItems', 'items', 'minItems', 'maxItems', 'uniqueItems'
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
    let keywords = ['minimum', 'maximum', 'multipleOf']
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
      'propertyDependencies'
    ]
    let validations = this.validations(keywords)
    let block = ``

    if (validations.length > 0) {
      block += `
      // object validations
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
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
    let keywords = ['maxLength', 'minLength', 'pattern', 'format']
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
    let conditions = ['value !== undefined']
    let block = ``

    if (enumerated) {
      enumerated.forEach(value => {
        switch (typeof value) {
          case 'boolean':
            conditions.push(`value !== ${value}`)
            break

          case 'number':
            conditions.push(`value !== ${value}`)
            break

          case 'string':
            conditions.push(`value !== "${value}"`)
            break

          case 'object':
            if (value === null) {
              conditions.push(`value !== null`)
            } else {
              conditions.push(
                `'${JSON.stringify(value)}' !== JSON.stringify(value)`
              )
            }
            break

          default:
            throw new Error('Things are not well in the land of foo')

        }
      })

      block += `
      // validate enum
      if (${conditions.join(' && ')}) {
        valid = false
        errors.push({
          keyword: 'enum',
          message: JSON.stringify(value) + ' is not an enumerated value'
        })
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
    let {schema,address} = this
    let {properties,required} = schema
    let block = ``

    // ensure the value of "required" schema property is an array
    required = (Array.isArray(required) ? required : [])

    if (typeof properties === 'object') {
      Object.keys(properties).forEach(key => {
        let subschema = properties[key]
        let isRequired = required.indexOf(key) !== -1
        // TODO
        // how should we be calculating these things? should be json pointer?
        // needs a separate function
        let pointer = [address, key].filter(segment => !!segment).join('.')
        let validation = new Validator(subschema, pointer)
        block += validation.compile(isRequired)
      })
    }

    return block
  }

  /**
   * patternProperties
   */
  patternProperties () {
    let {schema,address} = this
    let {patternProperties} = schema
    let validations = ``
    let block = ``

    if (typeof patternProperties === 'object') {
      Object.keys(patternProperties).forEach(pattern => {
        let subschema = patternProperties[pattern]
        let validator = new Validator(subschema, `pattern: ${pattern}`)
        validations += `
          if (key.match('${pattern}')) {
            ${validator.compile()}
          }
        `
      })
    }

    block += `
        parent = value
        for (let key in parent) {
          ${validations}
        }
        value = parent
    `

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

    if (additionalProperties === false) {
      block += `
      // additionalProperties
      for (let key in data) {
        if (${conditions}) {
          valid = false
          errors.push({
            keyword: 'additionalProperties',
            message: key + ' is not a defined property'
          })
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
            keyword: 'minProperties',
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
            keyword: 'maxProperties',
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
        errors.push({
          keyword: 'required',
          message: 'is required'
        })
      }
    `

    return block
  }

  /**
   * Array Validations
   */
  additionalItems () {
    let {schema:{items,additionalItems}, address} = this
    let block = ``

    if (additionalItems === false && Array.isArray(items)) {
      block += `
        // don't allow additional items
        if (value.length > ${items.length}) {
          valid = false
          errors.push({
            keyword: 'additionalItems',
            message: 'additional items not allowed'
          })
        }
      `
    }

    if (
      typeof additionalItems === 'object' &&
      additionalItems !== null &&
      Array.isArray(items)
    ) {
      let subschema = additionalItems
      let validator = new Validator(subschema, address + `[?]`) // array reference

      block += `
        // additional items
        parent = value

        for (var i = ${items.length}; i <= parent.length; i++) {
          ${validator.compile()}
        }

        value = parent
      `
    }

    return block
  }

  /**
   * Items
   *
   * Code to generate
   *
   *     // this outer conditional is generated by this.array()
   *     if (Array.isArray(value) {
   *       let parent = value
   *       for (let i = 0; i < parent.length; i++) {
   *         value = parent[i]
   *         // other validation code depending on value here
   *       }
   *       value = parent
   *     }
   *
   */
  items () {
    let {schema:{items}, address} = this
    let block = ``

    // if items is an object
    if (Array.isArray(items)) {
      items.forEach((item, index) => {
        let subschema = item
        let validator = new Validator(subschema, `${address}[${index}]`)

        block += `
          // item #${index}
          parent = value
          ${validator.compile()}
          value = parent
        `

      })

    // if items is an array
    } else if (typeof items === 'object' && items !== null) {
      let subschema = items
      let validator = new Validator(subschema, address + `[?]`) // array reference

      block += `
        // additional items
        parent = value

        for (var i = 0; i <= parent.length; i++) {
          ${validator.compile()}
        }

        value = parent
      `
    }

    return block
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
            keyword: 'minItems',
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
          errors.push({
            keyword: 'maxItems',
            message: 'too many properties'
          })
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
          errors.push({
            keyword: 'uniqueItems',
            message: 'items must be unique'
          })
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
          errors.push({
            keyword: 'minLength',
            message: 'too short'
          })
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
          errors.push({
            keyword: 'maxLength',
            message: 'too long'
          })
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
            errors.push({
              keyword: 'pattern',
              message: 'does not match the required pattern'
            })
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
        errors.push({
          keyword: 'format',
          message: 'is not "${format}" format'
        })
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
          errors.push({
            keyword: 'minimum',
            message: 'too small'
          })
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
          errors.push({
            keyword: 'maximum',
            message: 'too large'
          })
        }
    `
  }

  /**
   * multipleOf
   */
  multipleOf () {
    let {schema:{multipleOf}} = this
    let block = ``

    if (typeof multipleOf === 'number') {
      let length = multipleOf.toString().length
      let decimals = length - multipleOf.toFixed(0).length - 1
      let pow = decimals > 0 ? Math.pow(10, decimals) : 1
      let condition

      if (decimals > 0) {
        condition = `(value * ${pow}) % ${multipleOf * pow} !== 0`
      } else {
        condition = `value % ${multipleOf} !== 0`
      }

      block += `
        if (${condition}) {
          valid = false
          errors.push({
            keyword: 'multipleOf',
            message: 'must be a multiple of ${multipleOf}'
          })
        }
      `
    }

    return block
  }
}

module.exports = Validator
