'use strict'

/**
 * Module dependencies
 */
const path = require('path')

/**
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
          fn: 'property',
          key,
          ref: refchain.join('.'),
          chain: refchain,
        }

        // console.log(key, descriptor)

        if (descriptor.private) {
          operation.private = true
        }

        if (descriptor.default) {
          operation.default = descriptor.default
        }

        if (descriptor.immutable) {
          operation.immutable = true
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

    // console.log(block)

    return new Function('target', 'source', 'options', block)
  }

  property (operation) {
    if (operation.private) {
      return this.private(operation)
    } else {
      return this.assign(operation)
    }
  }

  private (operation) {
    return `
    if (options.private) {
      ${this.assign(operation)}
    }
    `
  }

  assign (operation) {
    return `
    if (${this.condition(operation)}) {
      ${operation.immutable ? this.immutableAssign(operation) : this.simpleAssign(operation)}
    } ${operation.default ? this.defaults(operation) : ''}
    `
  }

  immutableAssign (operation) {
    let target = 'target'
    let ref = operation.chain.slice(0, operation.chain.length-1).join('.')
    if (ref) {
      target = `${target}.${ref}`
    }

    return `
    if (${this.condition(operation)}) {
      Object.defineProperty(${target}, '${operation.key}', {
        value: source.${operation.ref},
        writable: ${!operation.immutable},
        enumerable: true
      })
    } ${operation.default ? this.defaults(operation) : ''}
    `
  }

  simpleAssign (operation) {
    return `
    if (${this.condition(operation)}) {
      target.${operation.ref} = source.${operation.ref}
    } ${operation.default ? this.defaults(operation) : ''}
    `
  }

  defaults (operation) {
    if (typeof operation.default === 'function') {
      operation.defaultString = `(${operation.default.toString()})()`
    } else {
      operation.defaultString = JSON.stringify(operation.default)
    }

    return `
    else if (options.defaults !== false) {
      ${operation.immutable ? this.immutableDefault(operation) : this.simpleDefault(operation)}
    }
    `
  }

  simpleDefault (operation) {
    return `target.${operation.ref} = ${operation.defaultString}`
  }

  immutableDefault (operation) {
    let target = 'target'
    let ref = operation.chain.slice(0, operation.chain.length-1).join('.')
    if (ref) {
      target = `${target}.${ref}`
    }

    return `
    Object.defineProperty(${target}, '${operation.key}', {
      value: ${operation.defaultString},
      writable: ${!operation.immutable},
      enumerable: true
    })
    `
  }

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
    return `
    // should this check the source object for
    // presence of the reference or some default property
    // before adding this property to the source?
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
