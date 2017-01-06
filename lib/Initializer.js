'use strict';

/**
 * Initializer
 */

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Initializer = function () {
  _createClass(Initializer, null, [{
    key: 'compile',


    /**
     * Compile (static)
     */
    value: function compile(schema) {
      var initializer = new Initializer(schema);
      initializer.parse();
      return initializer.compile();
    }

    /**
     * Constructor
     */

  }]);

  function Initializer(schema) {
    _classCallCheck(this, Initializer);

    this.schema = schema;
  }

  /**
   * Parse
   */


  _createClass(Initializer, [{
    key: 'parse',
    value: function parse() {
      var schema = this.schema;
      var operations = this.operations = new Map();

      function parser(schema, chain) {
        var properties = schema.properties || {};

        Object.keys(properties).forEach(function (key) {
          var refchain = chain.concat([key]);
          var descriptor = properties[key];

          // operation
          var operation = {
            key: key,
            fn: 'property',
            ref: refchain.join('.'),
            chain: refchain
          };

          // TODO:
          // The repetitious nature of these conditionals is becoming absurd.
          // Consider using Object.assign(operation, descriptor)
          if (descriptor.private) {
            operation.private = true;
          }

          if (descriptor.default) {
            operation.default = descriptor.default;
          }

          if (descriptor.immutable) {
            operation.immutable = true;
          }

          if (descriptor.set) {
            operation.setter = descriptor.set;
          }

          if (descriptor.after) {
            operation.after = descriptor.after;
          }

          // this descriptor is for a property
          if (!descriptor.properties) {

            // assignment
            operations.set(refchain, operation);

            // this is a nested schema
          } else {
            if (!operations.get(refchain)) {
              operation.fn = 'ensureContainer';
              operations.set(refchain, operation);
            }

            // recurse
            parser(descriptor, refchain);
          }
        });
      }

      parser(schema, []);
    }

    /**
     * Compile
     */

  }, {
    key: 'compile',
    value: function compile() {
      var _this = this;

      var block = 'options = options || {}\n';

      this.operations.forEach(function (operation) {
        block += _this[operation.fn](operation);
      });

      return new Function('target', 'source', 'options', block);
    }

    /**
     * Grammar
     */

    /**
     * Property
     */

  }, {
    key: 'property',
    value: function property(operation) {
      if (operation.private) {
        return this.private(operation);
      } else {
        return this.assign(operation);
      }
    }

    /**
     * Private
     */

  }, {
    key: 'private',
    value: function _private(operation) {
      return '\n    if (options.private) {\n      ' + this.assign(operation) + '\n    }\n    ';
    }

    /**
     * Assign
     */

  }, {
    key: 'assign',
    value: function assign(operation) {
      var assignment = void 0;

      if (operation.setter) {
        assignment = this.setterAssign(operation);
      } else if (operation.immutable) {
        assignment = this.immutableAssign(operation);
      } else {
        assignment = this.simpleAssign(operation);
      }

      assignment = '\n    if (' + this.condition(operation) + ') {\n      ' + assignment + '\n    } ' + (operation.default ? this.defaults(operation) : '') + '\n    ';

      if (operation.after) {
        assignment += this.afterAssign(operation);
      }

      return assignment;
    }

    /**
     * Immutable assign
     */

  }, {
    key: 'immutableAssign',
    value: function immutableAssign(operation) {
      var target = 'target';
      var ref = operation.chain.slice(0, operation.chain.length - 1).join('.');

      // add reference to nested property container
      if (ref) {
        target = target + '.' + ref;
      }

      return 'Object.defineProperty(' + target + ', \'' + operation.key + '\', {\n        value: source.' + operation.ref + ',\n        writable: ' + !operation.immutable + ',\n        enumerable: true\n      })';
    }

    /**
     * Simple assign
     */

  }, {
    key: 'simpleAssign',
    value: function simpleAssign(operation) {
      return 'target.' + operation.ref + ' = source.' + operation.ref;
    }

    /**
     * Setter assign
     */

  }, {
    key: 'setterAssign',
    value: function setterAssign(operation) {
      return 'target.' + operation.ref + ' = (' + operation.setter.toString() + ')(source)';
    }

    /**
     * After assign
     * TODO:
     * These invocations should take place at the end of the
     * generated function
     */

  }, {
    key: 'afterAssign',
    value: function afterAssign(operation) {
      return '\n    (' + operation.after.toString() + ').call(target, source)\n    ';
    }

    /**
     * Defaults
     */

  }, {
    key: 'defaults',
    value: function defaults(operation) {
      // TODO:
      // It's not optimal to inline the function definition
      // because the function gets created each time the
      // initializer function is run. Rather, we need to be
      // able to reference functions by symbols/methods available to
      // the definition scope.
      if (typeof operation.default === 'function') {
        operation.defaultString = '(' + operation.default.toString() + ')()';
      } else {
        operation.defaultString = JSON.stringify(operation.default);
      }

      return 'else if (options.defaults !== false) {\n      ' + (operation.immutable ? this.immutableDefault(operation) : this.simpleDefault(operation)) + '\n    }';
    }

    /**
     * Simple default
     */

  }, {
    key: 'simpleDefault',
    value: function simpleDefault(operation) {
      return 'target.' + operation.ref + ' = ' + operation.defaultString;
    }

    /**
     * Immutable default
     */

  }, {
    key: 'immutableDefault',
    value: function immutableDefault(operation) {
      var target = 'target';
      var ref = operation.chain.slice(0, operation.chain.length - 1).join('.');

      // add reference to nested property container
      if (ref) {
        target = target + '.' + ref;
      }

      return 'Object.defineProperty(' + target + ', \'' + operation.key + '\', {\n        value: ' + operation.defaultString + ',\n        writable: ' + !operation.immutable + ',\n        enumerable: true\n      })';
    }

    /**
     * Condition
     */

  }, {
    key: 'condition',
    value: function condition(operation) {
      var chain = operation.chain;
      var ref = operation.ref;

      var guards = chain.reduce(function (result, key, index) {
        if (index > 0) {
          result.push('source.' + chain.slice(0, index).join('.'));
        }
        return result;
      }, []).join(' && ');

      var condition = guards ? guards + ' && source.' + ref + ' !== undefined' : 'source.' + ref + ' !== undefined';

      return condition;
    }

    /**
     * Ensure object reference exists
     */

  }, {
    key: 'ensureContainer',
    value: function ensureContainer(operation) {
      // should this check the source object for
      // presence of the reference or some default property
      // before adding this property to the source?
      return '\n    if (!target.' + operation.ref + ') {\n      target.' + operation.ref + ' = {}\n    }\n    ';
    }
  }]);

  return Initializer;
}();

/**
 * Export
 */


module.exports = Initializer;