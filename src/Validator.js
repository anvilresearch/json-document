'use strict'

/**
 * Dependencies
 */
const FORMATS = require('./Formats')

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
      let parent = data
      let initialValidity, anyValid, countOfValid
      let initialErrorCount, accumulatedErrorCount
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
   * The instance compile method is "dumb". It only sequences invocation of
   * more specific compilation methods. It generates code to
   *
   *  - reference a value from input
   *  - validate type(s) of input
   *  - validate constraints described by various schema keywords
   *
   * Conditional logic related to code generation is pushed downsteam to
   * type-specific methods.
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
    block += this.anyOf()
    block += this.allOf()
    block += this.oneOf()

    return block
  }

  /**
   * reference
   *
   * @description
   * Generate code to get a value from instance for validation
   *
   * @returns {string}
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

    } else if (address.match(/\[APKey\]$/)) {
      block += `
        value = parent[key]
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
        // get ${address}
        value = ${guards.join(' && ')}
      `
    }

    return block
  }

  /**
   * type
   *
   * @description
   * > An instance matches successfully if its primitive type is one of the
   * > types defined by keyword. Recall: "number" includes "integer".
   * > JSON Schema Validation Section 5.5.2
   *
   * @returns {string}
   */
  type () {
    let {schema:{type},address} = this
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
      // ${address} type checking
      if (value !== undefined && ${conditions}) {
        valid = false
        errors.push({
          keyword: 'type',
          message: 'invalid type'
        })
      }
      `
    }

    return block
  }

  /**
   * Type-specific validations
   *
   * Type checking is optional in JSON Schema, and a schema can allow
   * multiple types. Generated code needs to apply type-specific validations
   * only to appropriate values, and ignore everything else. Type validation
   * itself is handled separately from other validation keywords.
   *
   * The methods `array`, `number`, `object`, `string` generate type-specific
   * validation code blocks, wrapped in a conditional such that they will
   * only be applied to values of that type.
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
   * array
   *
   * @description
   * @returns {string}
   */
  array () {
    let keywords = [
      'additionalItems', 'items', 'minItems', 'maxItems', 'uniqueItems'
    ]
    let validations = this.validations(keywords)
    let block = ``

    if (validations.length > 0) {
      block += `
      /**
       * Array validations
       */
      if (Array.isArray(value)) {
      ${validations}
      }
      `
    }

    return block
  }

  /**
   * number
   *
   * @description
   * @returns {string}
   */
  number () {
    let keywords = ['minimum', 'maximum', 'multipleOf']
    let validations = this.validations(keywords)
    let block = ``

    if (validations.length > 0) {
      block += `
      /**
       * Number validations
       */
      if (typeof value === 'number') {
      ${validations}
      }
      `
    }

    return block
  }

  /**
   * object
   *
   * @description
   * @returns {string}
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
      /**
       * Object validations
       */
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      ${validations}
      }
      `
    }

    return block
  }

  /**
   * string
   *
   * @description
   * String-specific validation code generation
   *
   * @returns {string}
   */
  string () {
    let keywords = ['maxLength', 'minLength', 'pattern', 'format']
    let validations = this.validations(keywords)
    let block = ``

    if (validations.length > 0) {
      block += `
      /**
       * String validations
       */
      if (typeof value === 'string') {
      ${validations}
      }
      `
    }

    return block
  }

  /**
   * validations
   *
   * @description
   * Iterate over keywords and invoke code generator methods for each.
   * Concatenate the results together and return. Used by "type" methods
   * such as this.array() and this.string()
   *
   * @param {Array} keywords
   * @returns {string}
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
   * enum
   *
   * @description
   * > An instance validates successfully against this keyword if its value
   * > is equal to one of the elements in this keyword's array value.
   * > JSON Schema Validation Section 5.5.1
   *
   * @returns {string}
   */
  enum () {
    let {schema:{enum: enumerated},address} = this
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
      /**
       * Validate "${address}" enum
       */
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
   *
   * @description
   * > An instance validates successfully against this keyword if it
   * > validates successfully against at least one schema defined by this
   * > keyword's value.
   * > JSON Schema Validation Section 5.5.4
   *
   * @returns {string}
   */
  anyOf () {
    let {schema:{anyOf},address} = this
    let block = ``

    if (Array.isArray(anyOf)) {
      block += `
        initialValidity = valid
        initialErrorCount = errors.length
        anyValid = false
      `

      anyOf.forEach(subschema => {
        let validator = new Validator(subschema, address)
        block += `
        accumulatedErrorCount = errors.length
        ${validator.compile()}
        if (accumulatedErrorCount === errors.length) {
          anyValid = true
        }
        `
      })

      block += `
          if (anyValid === true) {
            valid = initialValidity
            errors = errors.slice(0, initialErrorCount)
          }
      `
    }

    return block
  }

  /**
   * allOf
   *
   * @description
   * > An instance validates successfully against this keyword if it
   * > validates successfully against all schemas defined by this keyword's
   * > value.
   * > JSON Schema Validation Section 5.5.3
   *
   * @returns {string}
   */
  allOf () {
    let {schema:{allOf},address} = this
    let block = ``

    if (Array.isArray(allOf)) {
      allOf.forEach(subschema => {
        let validator = new Validator(subschema, address)
        block += `
        ${validator.compile()}
        `
      })
    }

    return block
  }

  /**
   * oneOf
   *
   * @description
   * > An instance validates successfully against this keyword if it
   * > validates successfully against exactly one schema defined by this
   * > keyword's value.
   * > JSON Schema Validation Section 5.5.5
   *
   * @returns {string}
   */
  oneOf () {
    let {schema:{oneOf},address} = this
    let block = ``

    if (Array.isArray(oneOf)) {
      block += `
        /**
         * Validate ${address} oneOf
         */
        initialValidity = valid
        initialErrorCount = errors.length
        countOfValid = 0
      `

      oneOf.forEach(subschema => {
        let validator = new Validator(subschema, address)
        block += `
        accumulatedErrorCount = errors.length
        ${validator.compile()}
        if (accumulatedErrorCount === errors.length) {
          countOfValid += 1
        }
        `
      })

      block += `
          if (countOfValid === 1) {
            valid = initialValidity
            errors = errors.slice(0, initialErrorCount)
          } else {
            valid = false
            errors.push({
              keyword: 'oneOf',
              message: 'what is a reasonable error message for this case?'
            })
          }
      `
    }

    return block
  }

  /**
   * not
   *
   * @description
   * > An instance is valid against this keyword if it fails to validate
   * > successfully against the schema defined by this keyword.
   * > JSON Schema Validation Section 5.5.6
   *
   * @returns {string}
   */
  not () {
    return ``
  }

  /**
   * definitions
   *
   * @description
   * @returns {string}
   */
  definitions () {
    return ``
  }

  /**
   * properties
   *
   * @description
   * @returns {string}
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
   * Other Properties
   *
   * @description
   * This method is not for a keyword. It wraps validations for
   * patternProperties and additionalProperties in a single iteration over
   * an object-type value's properties.
   *
   * It should only be invoked once for a given subschema.
   *
   * @returns {string}
   */
  otherProperties () {
    return `
      /**
       * Validate Other Properties
       */
      parent = data // WE NEED TO ALWAYS BACK UP, NOT TO DATA, BUT TO PREV VAL
                    // SO THIS IS NOT DONE FOR NESTED???

      for (let key in parent) {
        value = parent[key]
        matched = false

        ${this.patternValidations()}
        ${this.additionalValidations()}
      }

      value = parent
    `
  }

  /**
   * Pattern Validations
   *
   * @description
   * @returns {string}
   */
  patternValidations () {
    let {schema:{patternProperties}} = this
    let block = ``

    if (typeof patternProperties === 'object') {
      Object.keys(patternProperties).forEach(pattern => {
        let subschema = patternProperties[pattern]
        let validator = new Validator(subschema, `pattern: ${pattern}`)
        block += `
          if (key.match('${pattern}')) {
            matched = true
            ${validator.compile()}
          }
        `
      })
    }

    return block
  }

  /**
   * Additional Validations
   *
   * @description
   * @returns {string}
   */
  additionalValidations () {
    let {schema:{properties,additionalProperties},address} = this
    let validations = ``
    let block = ``

    // catch additional unmatched properties
    let conditions = ['matched !== true']

    // ignore defined properties
    Object.keys(properties || {}).forEach(key => {
      conditions.push(`key !== '${key}'`)
    })

    // validate additional properties
    if (typeof additionalProperties === 'object') {
      let subschema = additionalProperties
      let validator = new Validator(subschema, address + '[APKey]')
      block += `
        // validate additional properties
        if (${conditions.join(' && ')}) {
          ${validator.compile()}
        }
      `
    }

    // error for additional properties
    if (additionalProperties === false) {
      block += `
        // validate non-presence of additional properties
        if (${conditions.join(' && ')}) {
          valid = false
          errors.push({
            keyword: 'additionalProperties',
            message: key + ' is not a defined property'
          })
        }
      `
    }

    return block

  }

  /**
   * patternProperties
   *
   * @description
   * @returns {string}
   */
  patternProperties () {
    let block = ``

    if (!this.otherPropertiesCalled) {
      this.otherPropertiesCalled = true
      block += this.otherProperties()
    }

    return block
  }

  /**
   * additionalProperties
   *
   * @description
   * @returns {string}
   */
  additionalProperties () {
    let block = ``

    if (!this.otherPropertiesCalled) {
      this.otherPropertiesCalled = true
      block += this.otherProperties()
    }

    return block
  }

  /**
   * minProperties
   *
   * @description
   * > An object instance is valid against "minProperties" if its number of
   * > properties is greater than, or equal to, the value of this keyword.
   * > JSON Schema Validation Section 5.4.2
   *
   * @returns {string}
   */
  minProperties () {
    let {schema:{minProperties},address} = this

    return `
        // ${address} min properties
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
   *
   * @description
   * > An object instance is valid against "maxProperties" if its number of
   * > properties is less than, or equal to, the value of this keyword.
   * > JSON Schema Validation Section 5.4.1
   *
   * @returns {string}
   */
  maxProperties () {
    let {schema:{maxProperties},address} = this

    return `
        // ${address} max properties
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
   *
   * @description
   * @returns {string}
   */
  dependencies () {
    let {schema:{dependencies},address} = this
    let block = ``

    if (typeof dependencies === 'object') {
      Object.keys(dependencies).forEach(key => {
        let dependency = dependencies[key]
        let conditions = []

        if (Array.isArray(dependency)) {
          dependency.forEach(item => {
            conditions.push(`parent['${item}'] === undefined`)
          })

          block += `
            if (parent['${key}'] !== undefined && (${conditions.join(' || ')})) {
              valid = false
              errors.push({
                keyword: 'dependencies',
                message: 'unmet dependencies'
              })
            }
          `
        } else if (typeof dependency === 'object') {
          let subschema = dependency
          let validator = new Validator(subschema, address)

          block += `
            if (parent['${key}'] !== undefined) {
              ${validator.compile()}
            }
          `
        }
      })
    }

    return block
  }

  /**
   * Required
   *
   * @description
   * > An object instance is valid against this keyword if its property set
   * > contains all elements in this keyword's array value.
   * > JSON Schema Validation Section 5.4.3
   *
   * @returns {string}
   */
  required () {
    let {schema:{properties},address} = this
    let block = ``

    block += `
      // validate ${address} presence
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
   * additionalItems
   *
   * @description
   * > Successful validation of an array instance with regards to these two
   * > keywords is determined as follows: if "items" is not present, or its
   * > value is an object, validation of the instance always succeeds,
   * > regardless of the value of "additionalItems"; if the value of
   * > "additionalItems" is boolean value true or an object, validation of
   * > the instance always succeeds; if the value of "additionalItems" is
   * > boolean value false and the value of "items" is an array, the
   * > instance is valid if its size is less than, or equal to, the size
   * > of "items".
   * > JSON Schema Validation Section 5.3.1
   *
   * @returns {string}
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
   * @description
   * > Successful validation of an array instance with regards to these two
   * > keywords is determined as follows: if "items" is not present, or its
   * > value is an object, validation of the instance always succeeds,
   * > regardless of the value of "additionalItems"; if the value of
   * > "additionalItems" is boolean value true or an object, validation of
   * > the instance always succeeds; if the value of "additionalItems" is
   * > boolean value false and the value of "items" is an array, the
   * > instance is valid if its size is less than, or equal to, the size
   * > of "items".
   * > JSON Schema Validation Section 5.3.1
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
   *
   * @returns {string}
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
   *
   * @description
   * > An array instance is valid against "minItems" if its size is greater
   * > than, or equal to, the value of this keyword.
   * > JSON Schema Validation Section 5.3.3
   *
   * @returns {string}
   */
  minItems () {
    let {schema:{minItems},address} = this

    return `
        // ${address} min items
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
   *
   * @description
   * > An array instance is valid against "maxItems" if its size is less
   * > than, or equal to, the value of this keyword.
   * > JSON Schema Validation Section 5.3.2
   *
   * @returns {string}
   */
  maxItems () {
    let {schema:{maxItems},address} = this

    return `
        // ${address} max items
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
   * @description
   * > If this keyword has boolean value false, the instance validates
   * > successfully. If it has boolean value true, the instance validates
   * > successfully if all of its elements are unique.
   * > JSON Schema Validation Section 5.3.4
   *
   * TODO
   * optimize
   *
   * @returns {string}
   */
  uniqueItems () {
    let {schema:{uniqueItems},address} = this
    let block = ``

    if (uniqueItems === true) {
      block += `
        // validate ${address} unique items
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
   * minLength
   *
   * @description
   * > A string instance is valid against this keyword if its length is
   * > greater than, or equal to, the value of this keyword. The length of
   * > a string instance is defined as the number of its characters as
   * > defined by RFC 4627 [RFC4627].
   * > JSON Schema Validation Section 5.2.2
   *
   * @returns {string}
   */
  minLength () {
    let {schema:{minLength},address} = this

    return `
        // ${address} validate minLength
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
   *
   * @description
   * > A string instance is valid against this keyword if its length is less
   * > than, or equal to, the value of this keyword. The length of a string
   * > instance is defined as the number of its characters as defined by
   * > RFC 4627 [RFC4627].
   * > JSON Schema Validation Section 5.2.1
   *
   * @returns {string}
   */
  maxLength () {
    let {schema:{maxLength},address} = this

    return `
        // ${address} validate maxLength
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
   *
   * @description
   * > A string instance is considered valid if the regular expression
   * > matches the instance successfully.
   * > JSON Schema Validation Section 5.2.3
   *
   * @returns {string}
   */
  pattern () {
    let {schema:{pattern},address} = this

    if (pattern) {
      return `
          // ${address} validate pattern
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
   *
   * @description
   * > Structural validation alone may be insufficient to validate that
   * > an instance meets all the requirements of an application. The
   * > "format" keyword is defined to allow interoperable semantic
   * > validation for a fixed subset of values which are accurately
   * > described by authoritative resources, be they RFCs or other
   * > external specifications.
   * > JSON Schema Validation Section 7.1
   *
   * @returns {string}
   */
  format () {
    let {schema:{format},address} = this
    let matcher = FORMATS[format]

    if (matcher) {
      return `
      // ${address} validate format
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
   * Minimum
   *
   * @description
   * > Successful validation depends on the presence and value of
   * > "exclusiveMinimum": if "exclusiveMinimum" is not present, or has
   * > boolean value false, then the instance is valid if it is greater
   * > than, or equal to, the value of "minimum"; if "exclusiveMinimum" is
   * > present and has boolean value true, the instance is valid if it is
   * > strictly greater than the value of "minimum".
   * > JSON Schema Validation Section 5.1.3
   *
   * @returns {string}
   */
  minimum () {
    let {schema:{minimum,exclusiveMinimum},address} = this
    let operator = exclusiveMinimum === true ? '<=' : '<'

    return `
        // ${address} validate minimum
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
   *
   * @description
   * > Successful validation depends on the presence and value of
   * > "exclusiveMaximum": if "exclusiveMaximum" is not present, or has
   * > boolean value false, then the instance is valid if it is lower than,
   * > or equal to, the value of "maximum"; if "exclusiveMaximum" has
   * > boolean value true, the instance is valid if it is strictly lower
   * > than the value of "maximum".
   * > JSON Schema Validation Section 5.1.2
   *
   * @returns {string}
   */
  maximum () {
    let {schema:{maximum,exclusiveMaximum},address} = this
    let operator = exclusiveMaximum === true ? '>=' : '>'

    return `
        // ${address} validate maximum
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
   *
   * @description
   * > A numeric instance is valid against "multipleOf" if the result of
   * > the division of the instance by this keyword's value is an integer.
   * > JSON Schema Validation Section 5.1.1
   *
   * @returns {string}
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
