'use strict'

/**
 * Module dependencies
 * @ignore
 */
const JSONPointer = require('./JSONPointer')

/**
 * Modes
 */
const THROW = 0
const RECOVER = 1
const SILENT = 2

/**
 * Operations list
 */
const OPERATIONS = [
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
class JSONPatch {

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
        throw new Error('Missing "op" in JSON Patch operation')
      }

      if (OPERATIONS.indexOf(op) === -1) {
        throw new Error('Invalid "op" in JSON Patch operation')
      }

      if (!operation.path) {
        throw new Error('Missing "path" in JSON Patch operation')
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
      throw new Error('Missing "value" in JSON Patch add operation')
    }

    let pointer = new JSONPointer(op.path, SILENT)
    pointer.add(target, op.value)
  }

  /**
   * Remove
   *
   * @param {Object} op
   * @param {Object} target
   */
  remove (op, target) {
    let pointer = new JSONPointer(op.path)
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
      throw new Error('Missing "value" in JSON Patch replace operation')
    }

    let pointer = new JSONPointer(op.path)
    pointer.replace(target, op.value)
  }

  /**
   * Move
   *
   * @param {Object} op
   * @param {Object} target
   */
  move (op, target) {
    if (op.from === undefined) {
      throw new Error('Missing "from" in JSON Patch move operation')
    }

    if (op.path.match(new RegExp(`^${op.from}`))) {
      throw new Error('Invalid "from" in JSON Patch move operation')
    }

    let pointer = new JSONPointer(op.path)
    let from = new JSONPointer(op.from)
    let value = from.get(target)

    from.remove(target)
    pointer.add(target, value)
  }

  /**
   * Copy
   *
   * @param {Object} op
   * @param {Object} target
   */
  copy (op, target) {
    if (op.from === undefined) {
      throw new Error('Missing "from" in JSON Patch copy operation')
    }

    let pointer = new JSONPointer(op.path)
    let from = new JSONPointer(op.from)
    let value = from.get(target)

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
      throw new Error('Missing "value" in JSON Patch test operation')
    }

    let pointer = new JSONPointer(op.path)
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
module.exports = JSONPatch
