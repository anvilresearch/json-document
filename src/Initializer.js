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
        let c = chain.concat([key])
        let descriptor = properties[key]

        // operation
        let operation = {
          name: 'start',
          key,
          container: c.join('.'),
          chain: c,
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
          operation.pointer = c.join('.')

          // assignment
          operations.set(c, operation)

        // this is a nested schema
        } else {
          if (!operations.get(c)) {
            operation.name = 'ensureContainer'
            operations.set(c, operation)
          }

          // recurse
          parser(descriptor, c)
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
      block += this[operation.name](operation)
    })

    return new Function('target', 'source', 'options', block)
  }

  start (operation) {
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
      target.${operation.pointer} = source.${operation.pointer}
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
      target.${operation.pointer} = ${operation.default}
    }
    `
  }

  condition (operation) {
    let chain = operation.chain
    let pointer = operation.pointer

    let guards = chain.reduce((result, key, index) => {
      if (index > 0) {
        result.push(`source.${chain.slice(0, index).join('.')}`)
      }
      return result
    }, []).join(' && ')

    let condition = (guards)
      ? `${guards} && source.${pointer} !== undefined`
      : `source.${pointer} !== undefined`

    return condition
  }

  /**
   * Ensure container object exists
   */
  ensureContainer (operation) {
    return `
    // should this check the source object for
    // presence of the container or some default property
    // before adding this property to the source?
    if (!target.${operation.container}) {
      target.${operation.container} = {}
    }
    `
  }

}

/**
 * Export
 */
module.exports = Initializer
