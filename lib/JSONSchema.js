'use strict';

/**
 * Module dependencies
 * @ignore
 */

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Initializer = require('./Initializer');
var Validator = require('./Validator');

/**
 * JSONSchema
 *
 * @class
 * Compiles JSON Schema documents to an object with object initialization
 * and validation methods.
 */

var JSONSchema = function () {

  /**
   * Constructor
   *
   * @param {Object} schema
   */
  function JSONSchema(schema) {
    _classCallCheck(this, JSONSchema);

    // TODO: optionally parse JSON string?
    Object.assign(this, schema);

    // add schema-derived initialize and validate methods
    Object.defineProperties(this, {
      initialize: {
        enumerable: false,
        writeable: false,
        value: Initializer.compile(schema)
      },
      validate: {
        enumerable: false,
        writeable: false,
        value: Validator.compile(schema)
      }
    });
  }

  /**
   * Extend
   *
   * @description
   * ...
   * Dear future,
   *
   * This function was meticulously plagiarized from some curious amalgam of
   * stackoverflow posts whilst dozing off at my keyboard, too deprived of REM-
   * sleep to recurse unassisted. If it sucks, you have only yourself to blame.
   *
   * Goodnight.
   *
   * @param {Object} schema
   * @returns {JSONSchema}
   */


  _createClass(JSONSchema, [{
    key: 'extend',
    value: function extend(schema) {
      function isObject(data) {
        return data && (typeof data === 'undefined' ? 'undefined' : _typeof(data)) === 'object' && data !== null && !Array.isArray(data);
      }

      function extender(target, source) {
        var result = Object.assign({}, target);
        if (isObject(target) && isObject(source)) {
          Object.keys(source).forEach(function (key) {
            if (isObject(source[key])) {
              if (!(key in target)) {
                Object.assign(result, _defineProperty({}, key, source[key]));
              } else {
                result[key] = extender(target[key], source[key]);
              }
            } else {
              Object.assign(result, _defineProperty({}, key, source[key]));
            }
          });
        }
        return result;
      }

      var descriptor = extender(this, schema);
      return new JSONSchema(descriptor);
    }
  }]);

  return JSONSchema;
}();

/**
 * Export
 */


module.exports = JSONSchema;