'use strict'

/**
 * Dependencies
 */
const fetch = require('node-fetch')

/**
 * Cache
 *
 * @class
 * Cache for JSON Schema remote reference resolution.
 */
class RemoteCache {

  /**
   * Constructor
   */
  constructor () {
    this.cache = {}
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
  resolve (uri) {
    if (this.cache[uri]) {
      return Promise.resolve(this.cache[uri])
    }

    return fetch(uri)
      .then(res => {
        return res.json()
      })
      .then(json => {
        this.cache[uri] = json
        return json
      })
  }

}

/**
 * Export
 */
module.exports = new RemoteCache()
