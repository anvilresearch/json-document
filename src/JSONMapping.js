'use strict'

/**
 * Module dependencies
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
class JSONMapping extends Map {

  /**
   * Constructor
   *
   * @description Translate pointers from JSON Strings into Pointer objects
   * @param {Object} mapping
   */
  constructor (mapping) {
    super()

    Object.keys(mapping).forEach(key => {
      let value = mapping[key]
      this.set(
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
    this.forEach((right, left) => {
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
    this.forEach((right, left) => {
      right.add(target, left.get(source))
    })
  }

}

/**
 * Exports
 */
module.exports = JSONMapping
