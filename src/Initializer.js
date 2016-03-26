'use strict'

/**
<<<<<<< HEAD
 * Module dependencies
 */
const path = require('path')

/**
=======
>>>>>>> compilers
 * Initializer
 */
class Initializer {

  /**
   * Constructor
   */
  constructor (schema) {
    this.schema = schema
  }

  /**
   * Parse
   */
  parse () {
    let schema = this.schema
    let operations = this.operations = new Map()

    function parser(schema, chain) {
      let properties = schema.properties

      Object.keys(properties).forEach(key => {
        let refchain = chain.concat([key])
        let descriptor = properties[key]

        // operation
        let operation = {
          key,
          fn: 'property',
          ref: refchain.join('.'),
          chain: refchain,
        }

        // TODO:
        // The repetitious nature of these conditionals is becoming absurd.
        // Consider using Object.assign(operation, descriptor)
        if (descriptor.private) {
          operation.private = true
        }

        if (descriptor.default) {
          operation.default = descriptor.default
        }

        if (descriptor.immutable) {
          operation.immutable = true
        }

        if (descriptor.set) {
          operation.setter = descriptor.set
        }

        if (descriptor.after) {
          operation.after = descriptor.after
        }

        // this descriptor is for a property
        if (!descriptor.properties) {

          // assignment
          operations.set(refchain, operation)

        // this is a nested schema
        } else {
          if (!operations.get(refchain)) {
            operation.fn = 'ensureContainer'
            operations.set(refchain, operation)
          }

          // recurse
          parser(descriptor, refchain)
        }
      })
    }

    parser(schema, [])
  }

  /**
   * Compile
   */
  compile () {
    let block = 'options = options || {}\n'

    this.operations.forEach(operation => {
      block += this[operation.fn](operation)
    })

    return new Function('target', 'source', 'options', block)
  }

  /**
   * Grammar
   */

  /**
   * Property
   */
  property (operation) {
    if (operation.private) {
      return this.private(operation)
    } else {
      return this.assign(operation)
    }
  }

  /**
   * Private
   */
  private (operation) {
    return `
    if (options.private) {
      ${this.assign(operation)}
    }
    `
  }

  /**
   * Assign
   */
  assign (operation) {
    let assignment

    if (operation.setter) {
      assignment = this.setterAssign(operation)
    } else if (operation.immutable) {
      assignment = this.immutableAssign(operation)
    } else {
      assignment = this.simpleAssign(operation)
    }

    assignment = `
    if (${this.condition(operation)}) {
      ${assignment}
    } ${operation.default ? this.defaults(operation) : ''}
    `

    if (operation.after) {
      assignment += this.afterAssign(operation)
    }

    return assignment
  }

  /**
   * Immutable assign
   */
  immutableAssign (operation) {
    let target = 'target'
    let ref = operation.chain.slice(0, operation.chain.length-1).join('.')

    // add reference to nested property container
    if (ref) {
      target = `${target}.${ref}`
    }

    return `Object.defineProperty(${target}, '${operation.key}', {
        value: source.${operation.ref},
        writable: ${!operation.immutable},
        enumerable: true
      })`
  }

  /**
   * Simple assign
   */
  simpleAssign (operation) {
    return `target.${operation.ref} = source.${operation.ref}`
  }

  /**
   * Setter assign
   */
  setterAssign (operation) {
    return `target.${operation.ref} = (${operation.setter.toString()})(source)`
  }

  /**
   * After assign
   * TODO:
   * These invocations should take place at the end of the
   * generated function
   */
  afterAssign (operation) {
    return `
    (${operation.after.toString()}).call(target, source)
    `
  }

  /**
   * Defaults
   */
  defaults (operation) {
    // TODO:
    // It's not optimal to inline the function definition
    // because the function gets created each time the
    // initializer function is run. Rather, we need to be
    // able to reference functions by symbols/methods available to
    // the definition scope.
    if (typeof operation.default === 'function') {
      operation.defaultString = `(${operation.default.toString()})()`
    } else {
      operation.defaultString = JSON.stringify(operation.default)
    }

    return `else if (options.defaults !== false) {
      ${operation.immutable ? this.immutableDefault(operation) : this.simpleDefault(operation)}
    }`
  }

  /**
   * Simple default
   */
  simpleDefault (operation) {
    return `target.${operation.ref} = ${operation.defaultString}`
  }

  /**
   * Immutable default
   */
  immutableDefault (operation) {
    let target = 'target'
    let ref = operation.chain.slice(0, operation.chain.length-1).join('.')

    // add reference to nested property container
    if (ref) {
      target = `${target}.${ref}`
    }

    return `Object.defineProperty(${target}, '${operation.key}', {
        value: ${operation.defaultString},
        writable: ${!operation.immutable},
        enumerable: true
      })`
  }

  /**
   * Condition
   */
  condition (operation) {
    let chain = operation.chain
    let ref = operation.ref

    let guards = chain.reduce((result, key, index) => {
      if (index > 0) {
        result.push(`source.${chain.slice(0, index).join('.')}`)
      }
      return result
    }, []).join(' && ')

    let condition = (guards)
      ? `${guards} && source.${ref} !== undefined`
      : `source.${ref} !== undefined`

    return condition
  }

  /**
   * Ensure object reference exists
   */
  ensureContainer (operation) {
    // should this check the source object for
    // presence of the reference or some default property
    // before adding this property to the source?
    return `
    if (!target.${operation.ref}) {
      target.${operation.ref} = {}
    }
    `
  }

}

/**
 * Export
 */
module.exports = Initializer
