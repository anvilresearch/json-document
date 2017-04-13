'use strict'

/**
 * Mode enumeration
 */
const THROW = 0
const RECOVER = 1
const SILENT = 2

/**
 * JSONPointer
 *
 * @class
 * Implements RFC 6901: JavaScript Object Notation (JSON) Pointer
 * https://tools.ietf.org/html/rfc6901
 */
class JSONPointer {

  /**
   * Constructor
   */
  constructor (expr, mode) {
    this.expr = expr
    this.mode = mode || THROW
    this.tokens = (expr && expr.charAt(0) === '#')
      ? this.parseURIFragmentIdentifier(expr)
      : this.parseJSONString(expr)
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
    return new JSONPointer(expr)
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
      throw new Error('JSON Pointer must be a string')
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
   * Parse URI Fragment Identifer
   */
  parseURIFragmentIdentifier (expr) {
    if (typeof expr !== 'string') {
      throw new Error('JSON Pointer must be a string')
    }

    if (expr.charAt(0) !== '#') {
      throw new Error('Invalid JSON Pointer URI Fragment Identifier')
    }

    return this.parseJSONString(decodeURIComponent(expr.substr(1)))
  }

  /**
   * To URI Fragment Identifier
   *
   * @description Render a URI Fragment Identifier representation of a pointer
   * @returns {string}
   */
  toURIFragmentIdentifier () {
    let value = this.tokens.map(token => {
      return encodeURIComponent(this.escape(token))
    }).join('/')

    return `#/${value}`
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
      if (!current || current[tokens[i]] === undefined) {
        if (this.mode !== THROW) {
          return undefined
        } else {
          throw new Error('Invalid JSON Pointer reference')
        }
      }

      current = current[tokens[i]]
    }

    return current
  }

  /**
   * Add
   *
   * @description Set a value on a target object referenced by the pointer. Put
   * will insert an array element. To change an existing array elemnent, use
   * `pointer.set()`
   * @param {Object} target
   * @param {*} value
   */
  add (target, value) {
    let tokens = this.tokens
    let current = target

    // iterate through the tokens
    for (let i = 0; i < tokens.length; i++) {
      let token = tokens[i]

      // set the property on the target location
      if (i === tokens.length - 1) {
        if (token === '-') {
          current.push(value)
        } else if (Array.isArray(current)) {
          current.splice(token, 0, value)
        } else if (value !== undefined) {
          current[token] = value
        }

      // handle missing target location based on "mode"
      } else if (!current[token]) {
        switch (this.mode) {
          case THROW:
            throw new Error('Invalid JSON Pointer reference')

          case RECOVER:
            current = current[token] = (parseInt(token)) ? [] : {}
            break

          case SILENT:
            return

          default:
              throw new Error('Invalid pointer mode')
        }

      // reference the next object in the path
      } else {
        current = current[token]
      }
    }
  }

  /**
   * Replace
   *
   * @description Set a value on a target object referenced by the pointer. Set will
   * overwrite an existing array element at the target location.
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
module.exports = JSONPointer
