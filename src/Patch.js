'use strict'

/**
 * Module dependencies
 */
const Pointer = require('./Pointer')

/**
 * Patch
 *
 * @class
 * Implements RFC 6902: JavaScript Object Notation (JSON) Patch
 * https://tools.ietf.org/html/rfc6902
 */
class Patch {

  /**
   * Constructor
   *
   * @param {Array} ops
   */
  constructor (ops) {
    this.ops = ops || []
  }

  /**
   * Apply
   *
   * @todo handle errors/roll back
   * @todo protect properties that are private in the schema
   * @todo map JSON Pointers real property names
   *
   * @param {Object} target
   */
  apply (target) {
    this.ops.forEach(operation => {
      this[operation.op](operation, target)
    })
  }

  /**
   * Add
   *
   * @param {Object} op
   * @param {Object} target
   */
  add (op, target) {
    let pointer = new Pointer(op.path)
    pointer.add(target, op.value)
  }

  /**
   * Remove
   *
   * @param {Object} op
   * @param {Object} target
   */
  remove (op, target) {
    let pointer = new Pointer(op.path)
    pointer.remove(target)
  }

  /**
   * Replace
   *
   * @param {Object} op
   * @param {Object} target
   */
  replace (op, target) {
    let pointer = new Pointer(op.path)
    pointer.replace(target, op.value)
  }

  /**
   * Move
   *
   * @param {Object} op
   * @param {Object} target
   */
  move (op, target) {
    let pointer = new Pointer(op.path)
    let from = new Pointer(op.from)
    let value = from.get(target)

    from.remove(target)
    pointer.add(target, value)
  }
}

/**
 * Exports
 */
module.exports = Patch
