'use strict'

/**
 * Pointer
 *
 * @class
 * Implements RFC 6901: JavaScript Object Notation (JSON) Pointer
 * https://tools.ietf.org/html/rfc6901
 */
class Pointer {

  /**
   * Constructor
   */
  constructor (expr) {
    this.expr = expr
    this.tokens = this.parseJSONString(expr)
  }

  /**
   * Escape
   */
  escape (expr) {
    return expr.replace(/~/g, '~0').replace(/\//g, '~1')
  }

  /**
   * Unescape
   */
  unescape (expr) {
    return expr.replace(/~1/g, '/').replace(/~0/g, '~')
  }

  /**
   * Parse JSON String
   *
   * @description Parse an expression into a list of tokens
   * @param {string} expr
   * @returns {Array}
   */
  parseJSONString (expr) {
    let tokens

    if (expr === '') {
      tokens = []
    } else if (expr === '/') {
      tokens = ['']
    } else {
      tokens = expr.substr(1).split('/')
    }

    return tokens
  }

    /**
   * Get
   *
   * @description Get a value from the source object referenced by the pointer
   * @param {Object} source
   * @returns {*}
   */
  get (source) {
    let current = source
    let tokens = this.tokens

    for (let i = 0; i < tokens.length; i++) {
      if (!current || !current[tokens[i]]) {
        return undefined
      }

      current = current[tokens[i]]
    }

    return current
  }

  /**
   * Set
   *
   * @description Set a value on a target object referenced by the pointer
   * @param {Object} target
   * @param {*} value
   */
  set (target, value) {
    let tokens = this.tokens
    let current = target

    for (let i = 0; i < tokens.length; i++) {
      let token = tokens[i]

      if (i === tokens.length - 1) {
        current[token] = value
      } else if (!current[token]) {
        current = current[token] = (parseInt(token)) ? [] : {}
      } else {
        current = current[token]
      }
    }
  }
}

/**
 * Exports
 */
module.exports = Pointer
