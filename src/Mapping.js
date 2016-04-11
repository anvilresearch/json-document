'use strict'

/**
 * Module dependencies
 */
const Pointer = require('./Pointer')

/**
 * Pointer mode
 */
const RECOVER = 1

/**
 * Mapping
 */
class Mapping extends Map {

  /**
   * Constructor
   */
  constructor (mapping) {
    super()

    // cast JSON Pointer strings to Pointer instances
    Object.keys(mapping).forEach(key => {
      let value = mapping[key]
      this.set(
        new Pointer(key, RECOVER),
        new Pointer(value, RECOVER)
      )
    })
  }

  /**
   * Map
   */
  map (target, source) {
    this.forEach((value, key) => {
      key.add(target, value.get(source))
    })
  }

  /**
   * Project
   */
  project (source, target) {
    this.forEach((value, key) => {
      value.add(target, key.get(source))
    })
  }

}

/**
 * Exports
 */
module.exports = Mapping
