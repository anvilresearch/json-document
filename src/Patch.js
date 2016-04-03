'use strict'

/**
 * Module dependencies
 */
const Pointer = require('./Pointer')

/**
 * Enumerations
 */
const validOperations = [
  'add',
  'remove',
  'replace',
  'move',
  'copy',
  'test'
]

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
      let op = operation.op

      if (!op) {
        throw new Error('Missing operation in JSON Patch')
      }

      if (validOperations.indexOf(op) === -1) {
        throw new Error('Invalid JSON Patch operation')
      }

      if (!operation.path) {
        throw new Error('Missing path in JSON Patch operation')
      }

      this[op](operation, target)
    })
  }

  /**
   * Add
   *
   * @param {Object} op
   * @param {Object} target
   */
  add (op, target) {
    if (op.value === undefined) {
      throw new Error('Missing value in JSON Patch add operation')
    }

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
    if (op.value === undefined) {
      throw new Error('Missing value in JSON Patch replace operation')
    }

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

  /**
   * Test
   *
   * @param {Object} op
   * @param {Object} target
   */
  test (op, target) {
    if (op.value === undefined) {
      throw new Error('Missing value in JSON Patch test operation')
    }

    let pointer = new Pointer(op.path)
    let value = pointer.get(target)

    switch (typeof op.value) {
      //case 'string':
      //case 'number':
      //case 'boolean':
      //  if (value !== op.value) {
      //    throw new Error('Mismatching JSON Patch test value')
      //  }
      default:
        if (value !== op.value) {
          throw new Error('Mismatching JSON Patch test value')
        }
    }

  }
}

/**
 * Exports
 */
module.exports = Patch
