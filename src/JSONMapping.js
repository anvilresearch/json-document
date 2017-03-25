'use strict'

/**
 * Module dependencies
 * @ignore
 */
const JSONPointer = require('./JSONPointer')

/**
 * JSONPointer mode
 */
const RECOVER = 1

/**
 * JSONMapping
 *
 * @class
 * Defines a means to declaratively translate between object
 * representations using JSON Pointer syntax.
 */
class JSONMapping {

  /**
   * Constructor
   *
   * @description Translate pointers from JSON Strings into Pointer objects
   * @param {Object} mapping
   */
  constructor (mapping) {
    Object.defineProperty(this, 'mapping', {
      enumerable: false,
      value: new Map()
    })

    Object.keys(mapping).forEach(key => {
      let value = mapping[key]
      this.mapping.set(
        new JSONPointer(key, RECOVER),
        new JSONPointer(value, RECOVER)
      )
    })
  }

  /**
   * Map
   *
   * @description Assign values from source to target by reading the mapping
   * from right to left.
   * @param {Object} target
   * @param {Object} source
   */
  map (target, source) {
    this.mapping.forEach((right, left) => {
      left.add(target, right.get(source))
    })
  }

  /**
   * Project
   *
   * @description Assign values from source to target by reading the mapping
   * from left to right.
   * @param {Object} source
   * @param {Object} target
   */
  project (source, target) {
    this.mapping.forEach((right, left) => {
      right.add(target, left.get(source))
    })
  }

}

/**
 * Exports
 */
module.exports = JSONMapping
