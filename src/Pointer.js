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
   *
   * TODO:
   *  - option to suppress throwing errors rather than handle with
   *    try/catch blocks
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
   * Parse
   */
  static parse (expr) {
    return new Pointer(expr)
  }

  /**
   * Parse JSON String
   *
   * @description Parse an expression into a list of tokens
   * @param {string} expr
   * @returns {Array}
   */
  parseJSONString (expr) {
    if (typeof expr !== 'string') {
      throw new Error('Invalid JSON Pointer')
    }

    if (expr === '') {
      return []
    }

    if (expr.charAt(0) !== '/') {
      throw new Error('Invalid JSON Pointer')
    }

    if (expr === '/') {
      return ['']
    }

    return expr.substr(1).split('/').map(this.unescape)
  }

  /**
   * To JSON String
   *
   * @description Render a JSON string representation of a pointer
   * @returns {string}
   */
  toJSONString () {
    return `/${this.tokens.map(this.escape).join('/')}`
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
        throw new Error('Invalid WTF')
      }

      current = current[tokens[i]]
    }

    return current
  }

  /**
   * Add
   *
   * @description Set a value on a target object referenced by the pointer. Put will insert an array element. To change an existing array elemnent, use `pointer.set()`
   */
  add (target, value) {
    let tokens = this.tokens
    let current = target

    for (let i = 0; i < tokens.length; i++) {
      let token = tokens[i]

      if (i === tokens.length - 1) {
        if (token === '-') {

        } else if (Array.isArray(current)) {
          current.splice(token, 0, value)
        } else {
          current[token] = value
        }
      } else if (!current[token]) {
        current = current[token] = (parseInt(token)) ? [] : {}
      } else {
        current = current[token]
      }
    }
  }

  /**
   * Replace
   *
   * @description Set a value on a target object referenced by the pointer. Set will overwrite an existing array element at the target location.
   * @param {Object} target
   * @param {*} value
   */
  replace (target, value) {
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

  /**
   * Del
   *
   * - if this is an array it should splice the value out
   */
  remove (target) {
    let tokens = this.tokens
    let current = target

    for (let i = 0; i < tokens.length; i++) {
      let token = tokens[i]

      if (current === undefined || current[token] === undefined) {
        return undefined
      } else if (Array.isArray(current)) {
        current.splice(token, 1)
        return undefined
      } else if (i === tokens.length - 1) {
        delete current[token]
      }

      current = current[token]
    }

    // delete from the target
  }

}


/**
 * Exports
 */
module.exports = Pointer
