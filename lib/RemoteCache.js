'use strict';

/**
 * Dependencies
 */

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var fetch = require('node-fetch');

/**
 * Cache
 *
 * @class
 * Cache for JSON Schema remote reference resolution.
 */

var RemoteCache = function () {

  /**
   * Constructor
   */
  function RemoteCache() {
    _classCallCheck(this, RemoteCache);

    this.cache = {};
  }

  /**
   * Resolve
   *
   * @description
   * Get schema from cache. If the schema is not present on the cache then
   * fetch it from the remote location and store it on the cache.
   *
   * @todo
   * This needs to be a little more sophisticated... ideally some sort of
   * timeout is needed.
   *
   * @param {uri} uri - URI of the remote schema reference
   */


  _createClass(RemoteCache, [{
    key: 'resolve',
    value: function resolve(uri) {
      var _this = this;

      if (this.cache[uri]) {
        return Promise.resolve(this.cache[uri]);
      }

      return fetch(uri).then(function (res) {
        return res.json();
      }).then(function (json) {
        _this.cache[uri] = json;
        return json;
      });
    }
  }]);

  return RemoteCache;
}();

/**
 * Export
 */


module.exports = new RemoteCache();