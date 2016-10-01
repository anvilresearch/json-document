'use strict'

/**
 * JSON Schema Formats
 *
 * TODO
 * Is there a good way to express these over multiple lines with comments
 * for easier debugging and auditing?
 */
const DATETIME_REGEXP = /^\d\d\d\d-[0-1]\d-[0-3]\d[t\s][0-2]\d:[0-5]\d:[0-5]\d(?:\.\d+)?(?:z|[+-]\d\d:\d\d)$/i
const URI_REGEXP = /^(?:[a-z][a-z0-9+-.]*)?(?:\:|\/)\/?[^\s]*$/i
const EMAIL_REGEXP = /^[a-z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)*$/i
const IPV4_REGEXP = /^(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)$/
const IPV6_REGEXP = /^\s*(?:(?:(?:[0-9a-f]{1,4}:){7}(?:[0-9a-f]{1,4}|:))|(?:(?:[0-9a-f]{1,4}:){6}(?::[0-9a-f]{1,4}|(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(?:(?:[0-9a-f]{1,4}:){5}(?:(?:(?::[0-9a-f]{1,4}){1,2})|:(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(?:(?:[0-9a-f]{1,4}:){4}(?:(?:(?::[0-9a-f]{1,4}){1,3})|(?:(?::[0-9a-f]{1,4})?:(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(?:(?:[0-9a-f]{1,4}:){3}(?:(?:(?::[0-9a-f]{1,4}){1,4})|(?:(?::[0-9a-f]{1,4}){0,2}:(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(?:(?:[0-9a-f]{1,4}:){2}(?:(?:(?::[0-9a-f]{1,4}){1,5})|(?:(?::[0-9a-f]{1,4}){0,3}:(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(?:(?:[0-9a-f]{1,4}:){1}(?:(?:(?::[0-9a-f]{1,4}){1,6})|(?:(?::[0-9a-f]{1,4}){0,4}:(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(?::(?:(?:(?::[0-9a-f]{1,4}){1,7})|(?:(?::[0-9a-f]{1,4}){0,5}:(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))(?:%.+)?\s*$/i
const HOSTNAME_REGEXP = /^[a-z](?:(?:[-0-9a-z]{0,61})?[0-9a-z])?(\.[a-z](?:(?:[-0-9a-z]{0,61})?[0-9a-z])?)*$/i

/**
 * Formats
 */
class Formats {

  /**
   * Initialize
   *
   * @description
   * Create a new Formats instance and register default formats
   *
   * @returns {Formats}
   */
  static initialize () {
    let formats = new Formats()
    formats.register('date-time', DATETIME_REGEXP)
    formats.register('uri', URI_REGEXP)
    formats.register('email', EMAIL_REGEXP)
    formats.register('ipv4', IPV4_REGEXP)
    formats.register('ipv6', IPV6_REGEXP)
    formats.register('hostname', HOSTNAME_REGEXP)
    return formats
  }

  /**
   * Register
   *
   * @description
   * Register a new mapping from named format to RegExp instance
   *
   * TODO
   * We can do some extra validation of the RegExp to
   * ensure it's the acceptable subset of RegExps allowed
   * by JSON Schema.
   *
   * @param {string} name
   * @param {RegExp} pattern
   * @returns {RegExp}
   */
  register (name, pattern) {
    // verify name is a string
    if (typeof name !== 'string') {
      throw new Error('Format name must be a string')
    }

    // cast a string to RegExp
    if (typeof pattern === 'string') {
      pattern = new RegExp(pattern)
    }

    return this[name] = pattern
  }

  /**
   * Resolve
   *
   * @description
   * Given a format name, return the corresponding registered validation. In the
   * event a format is not registered, throw an error.
   *
   * @param {string} name
   * @returns {RegExp}
   */
  resolve (name) {
    let format = this[name]

    if (!format) {
      throw new Error('Unknown JSON Schema format.')
    }

    return format
  }

  /**
   * Test
   *
   * @description
   * Test that a value conforms to a format.
   *
   * @param {string} name
   * @param {string} value
   * @returns {Boolean}
   */
  test (name, value) {
    let format = this.resolve(name)
    return format.test(value)
  }
}

/**
 * Export
 */
module.exports = Formats.initialize()
