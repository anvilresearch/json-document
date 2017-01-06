'use strict';

/**
 * Module dependencies
 * @ignore
 */

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var JSONPatch = require('./JSONPatch');

/**
 * JSONDocument
 *
 * @class
 * JSONDocument is a high level interface that binds together all other features of
 * this package and provides the principle method of data modeling.
 */

var JSONDocument = function () {
  _createClass(JSONDocument, null, [{
    key: 'schema',


    /**
     * Schema
     */
    get: function get() {
      throw new Error('Schema must be defined by classes extending JSONDocument');
    }

    /**
     * Constructor
     *
     * @param {Object} data
     * @param {Object} options
     */

  }]);

  function JSONDocument() {
    var data = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    _classCallCheck(this, JSONDocument);

    this.initialize(data, options);
  }

  /**
   * Initialize
   *
   * @param {Object} data
   * @param {Object} options
   */


  _createClass(JSONDocument, [{
    key: 'initialize',
    value: function initialize() {
      var data = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var schema = this.constructor.schema;

      schema.initialize(this, data, options);
    }

    /**
     * Validate
     *
     * @param {JSONSchema} alternate - OPTIONAL alternate schema
     * @returns {Object}
     */

  }, {
    key: 'validate',
    value: function validate(alternate) {
      var schema = this.constructor.schema;

      return (alternate || schema).validate(this);
    }

    /**
     * Patch
     *
     * @param {Array} ops
     */

  }, {
    key: 'patch',
    value: function patch(ops) {
      var patch = new JSONPatch(ops);
      patch.apply(this);
    }

    /**
     * Select
     */

  }, {
    key: 'select',
    value: function select() {}

    /**
     * Project
     *
     * @description
     * Given a mapping, return an object projected from the current instance.
     *
     * @example
     * let schema = new JSONSchema({
     *   properties: {
     *     foo: { type: 'Array' }
     *   }
     * })
     *
     * let mapping = new JSONMapping({
     *   '/foo/0': '/bar/baz'
     * })
     *
     * class FooTracker extends JSONDocument {
     *   static get schema () { return schema }
     * }
     *
     * let instance = new FooTracker({ foo: ['qux'] })
     * instance.project(mapping)
     * // => { bar: { baz: 'qux' } }
     *
     * @param {JSONMapping} mapping
     * @return {Object}
     */

  }, {
    key: 'project',
    value: function project(mapping) {
      return mapping.project(this);
    }

    /**
     * Serialize
     *
     * @param {Object} object
     * @returns {string}
     */

  }], [{
    key: 'serialize',
    value: function serialize(object) {
      return JSON.stringify(object);
    }

    /**
     * Deserialize
     *
     * @param {string} data
     * @return {*}
     */

  }, {
    key: 'deserialize',
    value: function deserialize(data) {
      try {
        return JSON.parse(data);
      } catch (e) {
        throw new Error('Failed to parse JSON');
      }
    }
  }]);

  return JSONDocument;
}();

/**
 * Export
 */


module.exports = JSONDocument;