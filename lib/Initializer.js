'use strict';

/**
 * Initializer
 */

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Initializer = function () {

  /**
   * constructor
   */
  function Initializer(schema, options) {
    _classCallCheck(this, Initializer);

    Object.assign(this, options || {});
    this.root = this.root || this;

    this.root.depth = this.root.depth || 1;

    if (this.level > this.root.depth) {
      this.root.depth = this.level;
    }

    this.level = this.level || 0;
    this.schema = schema;
  }

  /**
   * compile (static)
   */


  _createClass(Initializer, [{
    key: 'compile',


    /**
     * compile
     */
    value: function compile() {
      var root = this.root,
          depth = this.depth,
          level = this.level;

      var declarations = '';
      var body = '';

      // traverse the schema and generate code
      body += this.default();
      body += this.properties();
      //body += this.additionalProperties()
      body += this.items();
      //body += this.additionalItems()


      // value
      body += this.member();
      body += this.item();

      // after traversing the schema
      // generate the variable declarations
      if (root === this) {
        for (var i = 1; i <= this.root.depth; i++) {
          declarations += this.declaration(i);
        }

        return '\n        options = options || {}\n\n        if (options.filter === false) {\n          Object.assign(target, JSON.parse(JSON.stringify(source)))\n        }\n\n        ' + declarations + '\n        ' + body + '\n      ';
      }

      return body;
    }

    /**
     * declaration
     */

  }, {
    key: 'declaration',
    value: function declaration(level) {
      return '\n      var target' + level + '\n      var source' + level + '\n      var count' + level + '\n    ';
    }

    /**
     * default
     */

  }, {
    key: 'default',
    value: function _default() {
      var schema = this.schema,
          level = this.level,
          key = this.key,
          index = this.index;
      var value = schema.default; // rename default to value because it's a keyword and syntax highlighter breaks

      var block = '';

      if (schema.hasOwnProperty('default')) {

        if (key) {
          block += '\n          target' + level + '[\'' + key + '\'] = ' + JSON.stringify(value) + '\n        ';
        }

        if (index) {
          block += '\n          target' + level + '[' + index + '] = ' + JSON.stringify(value) + '\n        ';
        }

        if (level > 1) {
          block += '\n          count' + level + '++\n        ';
        }

        block = '\n        if (options.defaults !== false) {\n          ' + block + '\n        }\n      ';
      }

      return block;
    }

    /**
     * member
     */

  }, {
    key: 'member',
    value: function member() {
      var schema = this.schema,
          root = this.root,
          level = this.level,
          key = this.key;
      var properties = schema.properties,
          additionalProperties = schema.additionalProperties,
          items = schema.items,
          additionalItems = schema.additionalItems;

      var block = '';

      // `key` tells us to treat this subschema as an object member vs an array item
      // and the absence of the other values here indicates we are dealing with a
      // primitive value
      if (key && !properties && !additionalProperties && !items && !additionalItems) {

        // first generate the assignment statement
        block += '\n        target' + level + '[\'' + key + '\'] = source' + level + '[\'' + key + '\']\n      ';

        // for nested container objects, add the counter incrementing statement
        if (level > 1) {
          block += '\n          count' + level + '++\n        ';
        }

        // wrap the foregoing in a check for presence on the source
        block = '\n        if (source' + level + '.hasOwnProperty(\'' + key + '\')) {\n          ' + block + '\n        }\n      ';
      }

      return block;
    }

    /**
     * item
     */

  }, {
    key: 'item',
    value: function item() {
      var schema = this.schema,
          root = this.root,
          level = this.level,
          index = this.index;
      var properties = schema.properties,
          additionalProperties = schema.additionalProperties,
          items = schema.items,
          additionalItems = schema.additionalItems;

      var block = '';

      if (index && !properties && !additionalProperties && !items && !additionalItems) {

        block += '\n        target' + level + '[' + index + '] = source' + level + '[' + index + ']\n      ';

        if (level > 1) {
          block += '\n          count' + level + '++\n        ';
        }

        block = '\n        if (' + index + ' < len) {\n          ' + block + '\n        }\n      ';
      }

      return block;
    }

    /**
     * properties
     */

  }, {
    key: 'properties',
    value: function properties() {
      var schema = this.schema,
          root = this.root,
          level = this.level,
          key = this.key,
          index = this.index;
      var properties = schema.properties;

      var block = '';

      if (properties) {
        Object.keys(properties).forEach(function (key) {
          var subschema = properties[key];
          var initializer = new Initializer(subschema, { key: key, root: root, level: level + 1 });

          block += initializer.compile();
        });

        // root-level properties boilerplate
        if (root === this) {
          block = '\n          if (typeof source === \'object\' && source !== null && !Array.isArray(source)) {\n            if (typeof target !== \'object\') {\n              throw new Error(\'?\')\n            }\n\n            source1 = source\n            target1 = target\n            count1 = 0\n\n            ' + block + '\n          }\n        ';

          // nested properties boilerplate
        } else {

          if (index) {
            block = '\n            if (' + index + ' < source' + level + '.length || typeof source' + level + '[' + index + '] === \'object\') {\n\n              source' + (level + 1) + ' = source' + level + '[' + index + '] || {}\n              count' + (level + 1) + ' = 0\n\n              if (' + index + ' < target' + level + '.length || typeof target' + level + '[' + index + '] !== \'object\') {\n                target' + (level + 1) + ' = {}\n                if (' + index + ' < source' + level + '.length) {\n                  count' + (level + 1) + '++\n                }\n              } else {\n                target' + (level + 1) + ' = target' + level + '[' + index + ']\n              }\n\n              ' + block + '\n\n              if (count' + (level + 1) + ' > 0) {\n                target' + level + '[' + index + '] = target' + (level + 1) + '\n                count' + level + '++\n              }\n\n            } else {\n              target' + level + '[' + index + '] = source' + level + '[' + index + ']\n              count' + level + '++\n            }\n          ';
          }

          if (key) {
            block = '\n            if ((typeof source' + level + '[\'' + key + '\'] === \'object\'\n                  && source' + level + '[\'' + key + '\'] !== null\n                  && !Array.isArray(source' + level + '[\'' + key + '\']))\n                || !source' + level + '.hasOwnProperty(\'' + key + '\')) {\n\n              source' + (level + 1) + ' = source' + level + '[\'' + key + '\'] || {}\n              count' + (level + 1) + ' = 0\n\n              if (!target' + level + '.hasOwnProperty(\'' + key + '\')\n                  || typeof target' + level + '[\'' + key + '\'] !== \'object\'\n                  || target' + level + '[\'' + key + '\'] === null\n                  || Array.isArray(target' + level + '[\'' + key + '\'])) {\n                target' + (level + 1) + ' = {}\n                if (source' + level + '.hasOwnProperty(\'' + key + '\')) {\n                  count' + (level + 1) + '++\n                }\n              } else {\n                target' + (level + 1) + ' = target' + level + '[\'' + key + '\']\n                count' + (level + 1) + '++\n              }\n\n              ' + block + '\n\n              if (count' + (level + 1) + ' > 0) {\n                target' + level + '[\'' + key + '\'] = target' + (level + 1) + '\n                count' + level + '++\n              }\n\n            } else {\n              target' + level + '[\'' + key + '\'] = source' + level + '[\'' + key + '\']\n              count' + level + '++\n            }\n          ';
          }
        }
      }

      return block;
    }

    /**
     *
     */

  }, {
    key: 'additionalProperties',
    value: function additionalProperties() {}

    /**
     * items
     */

  }, {
    key: 'items',
    value: function items() {
      var schema = this.schema,
          root = this.root,
          level = this.level,
          key = this.key,
          index = this.index;
      var items = schema.items;

      var block = '';

      if (items) {

        if (Array.isArray(items)) {
          // TODO
          //
          //
          //
          //
          //
          // ...

        } else if ((typeof items === 'undefined' ? 'undefined' : _typeof(items)) === 'object' && items !== null) {
          var _index = 'i' + (level + 1);
          var initializer = new Initializer(items, { index: _index, root: root, level: level + 1 });

          block += '\n          var sLen = source' + (level + 1) + '.length || 0\n          var tLen = target' + (level + 1) + '.length || 0\n          var len = 0\n\n          if (sLen > len) { len = sLen }\n          // THIS IS WRONG, CAUSED SIMPLE ARRAY INIT TO FAIL (OVERWRITE\n          // EXISTING TARGET VALUES WITH UNDEFINED WHEN SOURCE IS SHORTER THAN\n          // TARGET). LEAVING HERE UNTIL WE FINISH TESTING AND SEE WHY IT MIGHT\n          // HAVE BEEN HERE IN THE FIRST PLACE.\n          //\n          // if (tLen > len) { len = tLen }\n\n          for (var ' + _index + ' = 0; ' + _index + ' < len; ' + _index + '++) {\n            ' + initializer.compile() + '\n          }\n        ';
        }

        // root-level properties boilerplate
        if (root === this) {
          block = '\n          if (Array.isArray(source)) {\n            if (!Array.isArray(target)) {\n              throw new Error(\'?\')\n            }\n\n            source1 = source\n            target1 = target\n\n            ' + block + '\n          }\n        ';

          // nested properties boilerplate
        } else {
          block = '\n          if (Array.isArray(source' + level + '[\'' + key + '\']) || !source' + level + '.hasOwnProperty(\'' + key + '\')) {\n\n            source' + (level + 1) + ' = source' + level + '[\'' + key + '\'] || []\n            count' + (level + 1) + ' = 0\n\n            if (!target' + level + '.hasOwnProperty(\'' + key + '\') || !Array.isArray(target' + level + '[\'' + key + '\'])) {\n              target' + (level + 1) + ' = []\n                if (source' + level + '.hasOwnProperty(\'' + key + '\')) {\n                  count' + (level + 1) + '++\n                }\n\n            } else {\n              target' + (level + 1) + ' = target' + level + '[\'' + key + '\']\n              count' + (level + 1) + '++\n            }\n\n            ' + block + '\n\n            if (count' + (level + 1) + ' > 0) {\n              target' + level + '[\'' + key + '\'] = target' + (level + 1) + '\n              count' + level + '++\n            }\n\n          } else {\n            target' + level + '[\'' + key + '\'] = source' + level + '[\'' + key + '\']\n            count' + level + '++\n          }\n        ';
        }
      }

      return block;
    }

    /**
     *
     */

  }, {
    key: 'additionalItems',
    value: function additionalItems() {}
  }], [{
    key: 'compile',
    value: function compile(schema) {
      var initializer = new Initializer(schema);
      var block = initializer.compile();

      //console.log(beautify(block))
      try {
        return new Function('target', 'source', 'options', block);
      } catch (e) {
        console.log(e, e.stack);
      }
    }
  }]);

  return Initializer;
}();

module.exports = Initializer;