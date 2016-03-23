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
      target.${operation.ref} = source.${operation.ref}
    } ${operation.default ? this.defaults(operation) : ''}
    `
  }

  defaults (operation) {
    if (typeof operation.default === 'function') {
      operation.default = `(${operation.default.toString()})()`
    } else {
      operation.default = JSON.stringify(operation.default)
    }
    return `
    else if (options.defaults !== false) {
      target.${operation.ref} = ${operation.default}
    }
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
