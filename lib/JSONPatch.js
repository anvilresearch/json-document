'use strict';

/**
 * Module dependencies
 * @ignore
 */

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var JSONPointer = require('./JSONPointer');

/**
 * Modes
 */
var THROW = 0;
var RECOVER = 1;
var SILENT = 2;

/**
 * Operations list
 */
var OPERATIONS = ['add', 'remove', 'replace', 'move', 'copy', 'test'];

/**
 * Patch
 *
 * @class
 * Implements RFC 6902: JavaScript Object Notation (JSON) Patch
 * https://tools.ietf.org/html/rfc6902
 */

var JSONPatch = function () {

  /**
   * Constructor
   *
   * @param {Array} ops
   */
  function JSONPatch(ops) {
    _classCallCheck(this, JSONPatch);

    this.ops = ops || [];
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


  _createClass(JSONPatch, [{
    key: 'apply',
    value: function apply(target) {
      var _this = this;

      this.ops.forEach(function (operation) {
        var op = operation.op;

        if (!op) {
          throw new Error('Missing "op" in JSON Patch operation');
        }

        if (OPERATIONS.indexOf(op) === -1) {
          throw new Error('Invalid "op" in JSON Patch operation');
        }

        if (!operation.path) {
          throw new Error('Missing "path" in JSON Patch operation');
        }

        _this[op](operation, target);
      });
    }

    /**
     * Add
     *
     * @param {Object} op
     * @param {Object} target
     */

  }, {
    key: 'add',
    value: function add(op, target) {
      if (op.value === undefined) {
        throw new Error('Missing "value" in JSON Patch add operation');
      }

      var pointer = new JSONPointer(op.path, SILENT);
      pointer.add(target, op.value);
    }

    /**
     * Remove
     *
     * @param {Object} op
     * @param {Object} target
     */

  }, {
    key: 'remove',
    value: function remove(op, target) {
      var pointer = new JSONPointer(op.path);
      pointer.remove(target);
    }

    /**
     * Replace
     *
     * @param {Object} op
     * @param {Object} target
     */

  }, {
    key: 'replace',
    value: function replace(op, target) {
      if (op.value === undefined) {
        throw new Error('Missing "value" in JSON Patch replace operation');
      }

      var pointer = new JSONPointer(op.path);
      pointer.replace(target, op.value);
    }

    /**
     * Move
     *
     * @param {Object} op
     * @param {Object} target
     */

  }, {
    key: 'move',
    value: function move(op, target) {
      if (op.from === undefined) {
        throw new Error('Missing "from" in JSON Patch move operation');
      }

      if (op.path.match(new RegExp('^' + op.from))) {
        throw new Error('Invalid "from" in JSON Patch move operation');
      }

      var pointer = new JSONPointer(op.path);
      var from = new JSONPointer(op.from);
      var value = from.get(target);

      from.remove(target);
      pointer.add(target, value);
    }

    /**
     * Copy
     *
     * @param {Object} op
     * @param {Object} target
     */

  }, {
    key: 'copy',
    value: function copy(op, target) {
      if (op.from === undefined) {
        throw new Error('Missing "from" in JSON Patch copy operation');
      }

      var pointer = new JSONPointer(op.path);
      var from = new JSONPointer(op.from);
      var value = from.get(target);

      pointer.add(target, value);
    }

    /**
     * Test
     *
     * @param {Object} op
     * @param {Object} target
     */

  }, {
    key: 'test',
    value: function test(op, target) {
      if (op.value === undefined) {
        throw new Error('Missing "value" in JSON Patch test operation');
      }

      var pointer = new JSONPointer(op.path);
      var value = pointer.get(target);

      switch (_typeof(op.value)) {
        //case 'string':
        //case 'number':
        //case 'boolean':
        //  if (value !== op.value) {
        //    throw new Error('Mismatching JSON Patch test value')
        //  }
        default:
          if (value !== op.value) {
            throw new Error('Mismatching JSON Patch test value');
          }
      }
    }
  }]);

  return JSONPatch;
}();

/**
 * Exports
 */


module.exports = JSONPatch;