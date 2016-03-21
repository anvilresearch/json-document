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

        // this descriptor is for a property
        if (!descriptor.properties) {

          // add default value logic
          if (descriptor.default) {
            operations.set(c, {
              name: 'simpleDefault',
              key: key,
              container: c.join('.'),
              chain: c,
              pointer: c.join('.'),
              default: JSON.stringify(descriptor.default)
            })

          // simple assignment
          } else {
            operations.set(c, {
              name: 'simple',
              key: key,
              container: c.join('.'),
              chain: c,
              pointer: c.join('.')
            })
          }

        // this is a nested schema
        } else {
          if (!operations.get(c)) {
            operations.set(c, {
              name: 'ensureContainer',
              key,
              container: c.join('.'),
              chain: c
              // this is where the magic happens
            })
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
    let block = ''

    this.operations.forEach(operation => {
      block += this[operation.name](operation)
    })

    return new Function('target', 'source', block)
  }

  /**
   * Simple assignment
   */
  simple (operation) {
    return `
    if (${this.condition(operation)}) {
      target.${operation.pointer} = source.${operation.pointer}
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
   * Simple assignment with default value
   */
  simpleDefault (operation) {
    return `
    if (source.${operation.pointer} !== undefined) {
      target.${operation.pointer} = source.${operation.pointer}
    } else {
      target.${operation.pointer} = ${operation.default}
    }
    `
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
