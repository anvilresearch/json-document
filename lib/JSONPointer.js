'use strict';

/**
 * Mode enumeration
 */

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var THROW = 0;
var RECOVER = 1;
var SILENT = 2;

/**
 * JSONPointer
 *
 * @class
 * Implements RFC 6901: JavaScript Object Notation (JSON) Pointer
 * https://tools.ietf.org/html/rfc6901
 */

var JSONPointer = function () {

  /**
   * Constructor
   */
  function JSONPointer(expr, mode) {
    _classCallCheck(this, JSONPointer);

    this.expr = expr;
    this.mode = mode || THROW;
    this.tokens = expr && expr.charAt(0) === '#' ? this.parseURIFragmentIdentifier(expr) : this.parseJSONString(expr);
  }

  /**
   * Escape
   */


  _createClass(JSONPointer, [{
    key: 'escape',
    value: function escape(expr) {
      return expr.replace(/~/g, '~0').replace(/\//g, '~1');
    }

    /**
     * Unescape
     */

  }, {
    key: 'unescape',
    value: function unescape(expr) {
      return expr.replace(/~1/g, '/').replace(/~0/g, '~');
    }

    /**
     * Parse
     */

  }, {
    key: 'parseJSONString',


    /**
     * Parse JSON String
     *
     * @description Parse an expression into a list of tokens
     * @param {string} expr
     * @returns {Array}
     */
    value: function parseJSONString(expr) {
      if (typeof expr !== 'string') {
        throw new Error('JSON Pointer must be a string');
      }

      if (expr === '') {
        return [];
      }

      if (expr.charAt(0) !== '/') {
        throw new Error('Invalid JSON Pointer');
      }

      if (expr === '/') {
        return [''];
      }

      return expr.substr(1).split('/').map(this.unescape);
    }

    /**
     * To JSON String
     *
     * @description Render a JSON string representation of a pointer
     * @returns {string}
     */

  }, {
    key: 'toJSONString',
    value: function toJSONString() {
      return '/' + this.tokens.map(this.escape).join('/');
    }

    /**
     * Parse URI Fragment Identifer
     */

  }, {
    key: 'parseURIFragmentIdentifier',
    value: function parseURIFragmentIdentifier(expr) {
      if (typeof expr !== 'string') {
        throw new Error('JSON Pointer must be a string');
      }

      if (expr.charAt(0) !== '#') {
        throw new Error('Invalid JSON Pointer URI Fragment Identifier');
      }

      return this.parseJSONString(decodeURIComponent(expr.substr(1)));
    }

    /**
     * To URI Fragment Identifier
     *
     * @description Render a URI Fragment Identifier representation of a pointer
     * @returns {string}
     */

  }, {
    key: 'toURIFragmentIdentifier',
    value: function toURIFragmentIdentifier() {
      var _this = this;

      var value = this.tokens.map(function (token) {
        return encodeURIComponent(_this.escape(token));
      }).join('/');

      return '#/' + value;
    }

    /**
     * Get
     *
     * @description Get a value from the source object referenced by the pointer
     * @param {Object} source
     * @returns {*}
     */

  }, {
    key: 'get',
    value: function get(source) {
      var current = source;
      var tokens = this.tokens;

      for (var i = 0; i < tokens.length; i++) {
        if (!current || current[tokens[i]] === undefined) {
          if (this.mode !== THROW) {
            return undefined;
          } else {
            throw new Error('Invalid JSON Pointer reference');
          }
        }

        current = current[tokens[i]];
      }

      return current;
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

  }, {
    key: 'add',
    value: function add(target, value) {
      var tokens = this.tokens;
      var current = target;

      // iterate through the tokens
      for (var i = 0; i < tokens.length; i++) {
        var token = tokens[i];

        // set the property on the target location
        if (i === tokens.length - 1) {
          if (token === '-') {
            current.push(value);
          } else if (Array.isArray(current)) {
            current.splice(token, 0, value);
          } else {
            current[token] = value;
          }

          // handle missing target location based on "mode"
        } else if (!current[token]) {
          switch (this.mode) {
            case THROW:
              throw new Error('Invalid JSON Pointer reference');

            case RECOVER:
              current = current[token] = parseInt(token) ? [] : {};
              break;

            case SILENT:
              return;

            default:
              throw new Error('Invalid pointer mode');
          }

          // reference the next object in the path
        } else {
          current = current[token];
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

  }, {
    key: 'replace',
    value: function replace(target, value) {
      var tokens = this.tokens;
      var current = target;

      for (var i = 0; i < tokens.length; i++) {
        var token = tokens[i];

        if (i === tokens.length - 1) {
          current[token] = value;
        } else if (!current[token]) {
          current = current[token] = parseInt(token) ? [] : {};
        } else {
          current = current[token];
        }
      }
    }

    /**
     * Del
     *
     * - if this is an array it should splice the value out
     */

  }, {
    key: 'remove',
    value: function remove(target) {
      var tokens = this.tokens;
      var current = target;

      for (var i = 0; i < tokens.length; i++) {
        var token = tokens[i];

        if (current === undefined || current[token] === undefined) {
          return undefined;
        } else if (Array.isArray(current)) {
          current.splice(token, 1);
          return undefined;
        } else if (i === tokens.length - 1) {
          delete current[token];
        }

        current = current[token];
      }

      // delete from the target
    }
  }], [{
    key: 'parse',
    value: function parse(expr) {
      return new JSONPointer(expr);
    }
  }]);

  return JSONPointer;
}();

/**
 * Exports
 */


module.exports = JSONPointer;