'use strict';

/**
 * Module dependencies
 * @ignore
 */

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var JSONPointer = require('./JSONPointer');

/**
 * JSONPointer mode
 */
var RECOVER = 1;

/**
 * JSONMapping
 *
 * @class
 * Defines a means to declaratively translate between object
 * representations using JSON Pointer syntax.
 */

var JSONMapping = function (_Map) {
  _inherits(JSONMapping, _Map);

  /**
   * Constructor
   *
   * @description Translate pointers from JSON Strings into Pointer objects
   * @param {Object} mapping
   */
  function JSONMapping(mapping) {
    _classCallCheck(this, JSONMapping);

    var _this = _possibleConstructorReturn(this, (JSONMapping.__proto__ || Object.getPrototypeOf(JSONMapping)).call(this));

    Object.keys(mapping).forEach(function (key) {
      var value = mapping[key];
      _this.set(new JSONPointer(key, RECOVER), new JSONPointer(value, RECOVER));
    });
    return _this;
  }

  /**
   * Map
   *
   * @description Assign values from source to target by reading the mapping
   * from right to left.
   * @param {Object} target
   * @param {Object} source
   */


  _createClass(JSONMapping, [{
    key: 'map',
    value: function map(target, source) {
      this.forEach(function (right, left) {
        left.add(target, right.get(source));
      });
    }

    /**
     * Project
     *
     * @description Assign values from source to target by reading the mapping
     * from left to right.
     * @param {Object} source
     * @param {Object} target
     */

  }, {
    key: 'project',
    value: function project(source, target) {
      this.forEach(function (right, left) {
        right.add(target, left.get(source));
      });
    }
  }]);

  return JSONMapping;
}(Map);

/**
 * Exports
 */


module.exports = JSONMapping;