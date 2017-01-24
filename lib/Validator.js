'use strict';

/**
 * Module dependencies
 * @ignore
 */

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var formats = require('./Formats');

/**
 * Validator
 *
 * Compile an object describing a JSON Schema into a validation function.
 */

var Validator = function () {
  _createClass(Validator, null, [{
    key: 'compile',


    /**
     * Compile (static)
     *
     * @description
     * Compile an object describing a JSON Schema into a validation function.
     *
     * @param {Object} schema
     * @returns {Function}
     */
    value: function compile(schema) {
      var validator = new Validator(schema);

      var body = '\n      // "cursor"\n      let value = data\n      let container\n      let stack = []\n      let top = -1\n\n      // error state\n      let valid = true\n      let errors = []\n\n      // complex schema state\n      let initialValidity\n      let anyValid\n      let notValid\n      let countOfValid\n      let initialErrorCount\n      let accumulatedErrorCount\n\n      // validation code\n      ' + validator.compile() + '\n\n      // validation result\n      return {\n        valid,\n        errors\n      }\n    ';

      return new Function('data', body);
    }

    /**
     * Constructor
     *
     * @param {Object} schema - object representation of a schema
     * @param {string} options - compilation options
     */

  }]);

  function Validator(schema) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    _classCallCheck(this, Validator);

    // assign schema to this
    this.schema = schema;

    // assign all options to this
    Object.assign(this, options);

    // ensure address is defined
    if (!this.address) {
      this.address = '';
    }

    // ensure require is boolean
    if (this.require !== true) {
      this.require = false;
    }
  }

  /**
   * Compile
   *
   * @description
   * The instance compile method is "dumb". It only sequences invocation of
   * more specific compilation methods. It generates code to
   *
   *  - read a value from input
   *  - validate type(s) of input
   *  - validate constraints described by various schema keywords
   *
   * Conditional logic related to code generation is pushed downsteam to
   * type-specific methods.
   */


  _createClass(Validator, [{
    key: 'compile',
    value: function compile() {
      var block = '';

      if (this.require) {
        block += this.required();
      }

      // type validation
      block += this.type();

      // type specific validation generators
      // null and boolean are covered by this.type()
      // integer should be covered by number and this.type()
      block += this.array();
      block += this.number();
      block += this.object();
      block += this.string();

      // non-type-specific validation generators
      block += this.enum();
      block += this.anyOf();
      block += this.allOf();
      block += this.not();
      block += this.oneOf();

      return block;
    }

    /**
     * push
     */

  }, {
    key: 'push',
    value: function push() {
      return '\n      stack.push(value)\n      container = value\n      top++\n    ';
    }

    /**
     * pop
     */

  }, {
    key: 'pop',
    value: function pop() {
      return '\n      if (stack.length > 1) {\n        top--\n        stack.pop()\n      }\n\n      value = container = stack[top]\n    ';
    }

    /**
     * type
     *
     * @description
     * > An instance matches successfully if its primitive type is one of the
     * > types defined by keyword. Recall: "number" includes "integer".
     * > JSON Schema Validation Section 5.5.2
     *
     * @returns {string}
     */

  }, {
    key: 'type',
    value: function type() {
      var type = this.schema.type,
          address = this.address;

      var block = '';

      if (type) {
        var types = Array.isArray(type) ? type : [type];
        var conditions = types.map(function (type) {
          // TODO: can we make a mapping object for this to clean it up?
          if (type === 'array') return '!Array.isArray(value)';
          if (type === 'boolean') return 'typeof value !== \'boolean\'';
          if (type === 'integer') return '!Number.isInteger(value)';
          if (type === 'null') return 'value !== null';
          if (type === 'number') return 'typeof value !== \'number\'';
          if (type === 'object') return '(typeof value !== \'object\' || Array.isArray(value) || value === null)';
          if (type === 'string') return 'typeof value !== \'string\'';
        }).join(' && ');

        block += '\n      // ' + address + ' type checking\n      if (value !== undefined && ' + conditions + ') {\n        valid = false\n        errors.push({\n          keyword: \'type\',\n          message: \'invalid type\'\n        })\n      }\n      ';
      }

      return block;
    }

    /**
     * Type-specific validations
     *
     * Type checking is optional in JSON Schema, and a schema can allow
     * multiple types. Generated code needs to apply type-specific validations
     * only to appropriate values, and ignore everything else. Type validation
     * itself is handled separately from other validation keywords.
     *
     * The methods `array`, `number`, `object`, `string` generate type-specific
     * validation code blocks, wrapped in a conditional such that they will
     * only be applied to values of that type.
     *
     * For example, the `number` method, given the schema
     *
     *     { minimum: 3 }
     *
     * will generate
     *
     *     if (typeof value === 'number') {
     *       if (value < 3) {
     *         valid = false
     *         errors.push({ message: '...' })
     *       }
     *     }
     *
     * Integer values are also numbers, and are validated the same as numbers
     * other than the type validation itself. Therefore no `integer` method is
     * needed.
     */

    /**
     * array
     *
     * @description
     * Invoke methods for array-specific keywords and wrap resulting code in
     * type-checking conditional so that any resulting validations are only
     * applied to array values.
     *
     * @returns {string}
     */

  }, {
    key: 'array',
    value: function array() {
      var keywords = ['additionalItems', 'items', 'minItems', 'maxItems', 'uniqueItems'];
      var validations = this.validations(keywords);
      var block = '';

      if (validations.length > 0) {
        block += '\n      /**\n       * Array validations\n       */\n      if (Array.isArray(value)) {\n      ' + validations + '\n      }\n      ';
      }

      return block;
    }

    /**
     * number
     *
     * @description
     * Invoke methods for number-specific keywords and wrap resulting code in
     * type-checking conditional so that any resulting validations are only
     * applied to number values.
     *
     * @returns {string}
     */

  }, {
    key: 'number',
    value: function number() {
      var keywords = ['minimum', 'maximum', 'multipleOf'];
      var validations = this.validations(keywords);
      var block = '';

      if (validations.length > 0) {
        block += '\n      /**\n       * Number validations\n       */\n      if (typeof value === \'number\') {\n      ' + validations + '\n      }\n      ';
      }

      return block;
    }

    /**
     * object
     *
     * @description
     * Invoke methods for object-specific keywords and wrap resulting code in
     * type-checking conditional so that any resulting validations are only
     * applied to object values.
     *
     * @returns {string}
     */

  }, {
    key: 'object',
    value: function object() {
      var keywords = ['maxProperties', 'minProperties', 'additionalProperties', 'properties', 'patternProperties', 'dependencies', 'schemaDependencies', 'propertyDependencies'];
      var validations = this.validations(keywords);
      var block = '';

      if (validations.length > 0) {
        block += '\n      /**\n       * Object validations\n       */\n      if (typeof value === \'object\' && value !== null && !Array.isArray(value)) {\n      ' + validations + '\n      }\n      ';
      }

      return block;
    }

    /**
     * string
     *
     * @description
     * Invoke methods for string-specific keywords and wrap resulting code in
     * type-checking conditional so that any resulting validations are only
     * applied to string values.
     *
     * @returns {string}
     */

  }, {
    key: 'string',
    value: function string() {
      var keywords = ['maxLength', 'minLength', 'pattern', 'format'];
      var validations = this.validations(keywords);
      var block = '';

      if (validations.length > 0) {
        block += '\n      /**\n       * String validations\n       */\n      if (typeof value === \'string\') {\n      ' + validations + '\n      }\n      ';
      }

      return block;
    }

    /**
     * validations
     *
     * @description
     * Iterate over an array of keywords and invoke code generator methods
     * for each. Concatenate the results together and return. Used by "type"
     * methods such as this.array() and this.string()
     *
     * @param {Array} keywords
     * @returns {string}
     */

  }, {
    key: 'validations',
    value: function validations(keywords) {
      var _this = this;

      var schema = this.schema;

      var block = '';

      var constraints = Object.keys(schema).filter(function (key) {
        return keywords.indexOf(key) !== -1;
      });

      constraints.forEach(function (keyword) {
        block += _this[keyword]();
      });

      return block;
    }

    /**
     * enum
     *
     * @description
     * > An instance validates successfully against this keyword if its value
     * > is equal to one of the elements in this keyword's array value.
     * > JSON Schema Validation Section 5.5.1
     *
     * @returns {string}
     */

  }, {
    key: 'enum',
    value: function _enum() {
      var enumerated = this.schema.enum,
          address = this.address;

      var conditions = ['value !== undefined'];
      var block = '';

      if (enumerated) {
        enumerated.forEach(function (value) {
          switch (typeof value === 'undefined' ? 'undefined' : _typeof(value)) {
            case 'boolean':
              conditions.push('value !== ' + value);
              break;

            case 'number':
              conditions.push('value !== ' + value);
              break;

            case 'string':
              conditions.push('value !== "' + value + '"');
              break;

            case 'object':
              if (value === null) {
                conditions.push('value !== null');
              } else {
                conditions.push('\'' + JSON.stringify(value) + '\' !== JSON.stringify(value)');
              }
              break;

            default:
              throw new Error('Things are not well in the land of enum');

          }
        });

        block += '\n      /**\n       * Validate "' + address + '" enum\n       */\n      if (' + conditions.join(' && ') + ') {\n        valid = false\n        errors.push({\n          keyword: \'enum\',\n          message: JSON.stringify(value) + \' is not an enumerated value\'\n        })\n      }\n      ';
      }

      return block;
    }

    /**
     * anyOf
     *
     * @description
     * > An instance validates successfully against this keyword if it
     * > validates successfully against at least one schema defined by this
     * > keyword's value.
     * > JSON Schema Validation Section 5.5.4
     *
     * @returns {string}
     */

  }, {
    key: 'anyOf',
    value: function anyOf() {
      var anyOf = this.schema.anyOf,
          address = this.address;

      var block = '';

      if (Array.isArray(anyOf)) {
        block += '\n        initialValidity = valid\n        initialErrorCount = errors.length\n        anyValid = false\n      ';

        anyOf.forEach(function (subschema) {
          var validator = new Validator(subschema, { address: address });
          block += '\n        accumulatedErrorCount = errors.length\n        ' + validator.compile() + '\n        if (accumulatedErrorCount === errors.length) {\n          anyValid = true\n        }\n        ';
        });

        block += '\n          if (anyValid === true) {\n            valid = initialValidity\n            errors = errors.slice(0, initialErrorCount)\n          }\n      ';
      }

      return block;
    }

    /**
     * allOf
     *
     * @description
     * > An instance validates successfully against this keyword if it
     * > validates successfully against all schemas defined by this keyword's
     * > value.
     * > JSON Schema Validation Section 5.5.3
     *
     * @returns {string}
     */

  }, {
    key: 'allOf',
    value: function allOf() {
      var allOf = this.schema.allOf,
          address = this.address;

      var block = '';

      if (Array.isArray(allOf)) {
        allOf.forEach(function (subschema) {
          var validator = new Validator(subschema, { address: address });
          block += '\n        ' + validator.compile() + '\n        ';
        });
      }

      return block;
    }

    /**
     * oneOf
     *
     * @description
     * > An instance validates successfully against this keyword if it
     * > validates successfully against exactly one schema defined by this
     * > keyword's value.
     * > JSON Schema Validation Section 5.5.5
     *
     * @returns {string}
     */

  }, {
    key: 'oneOf',
    value: function oneOf() {
      var oneOf = this.schema.oneOf,
          address = this.address;

      var block = '';

      if (Array.isArray(oneOf)) {
        block += '\n        /**\n         * Validate ' + address + ' oneOf\n         */\n        initialValidity = valid\n        initialErrorCount = errors.length\n        countOfValid = 0\n      ';

        oneOf.forEach(function (subschema) {
          var validator = new Validator(subschema, { address: address });
          block += '\n        accumulatedErrorCount = errors.length\n        ' + validator.compile() + '\n        if (accumulatedErrorCount === errors.length) {\n          countOfValid += 1\n        }\n        ';
        });

        block += '\n          if (countOfValid === 1) {\n            valid = initialValidity\n            errors = errors.slice(0, initialErrorCount)\n          } else {\n            valid = false\n            errors.push({\n              keyword: \'oneOf\',\n              message: \'what is a reasonable error message for this case?\'\n            })\n          }\n      ';
      }

      return block;
    }

    /**
     * not
     *
     * @description
     * > An instance is valid against this keyword if it fails to validate
     * > successfully against the schema defined by this keyword.
     * > JSON Schema Validation Section 5.5.6
     *
     * @returns {string}
     */

  }, {
    key: 'not',
    value: function not() {
      var not = this.schema.not,
          address = this.address;

      var block = '';

      if ((typeof not === 'undefined' ? 'undefined' : _typeof(not)) === 'object' && not !== null && !Array.isArray(not)) {
        var subschema = not;
        var validator = new Validator(subschema, { address: address });

        block += '\n        /**\n         * NOT\n         */\n        if (value !== undefined) {\n          initialValidity = valid\n          initialErrorCount = errors.length\n          notValid = true\n\n          accumulatedErrorCount = errors.length\n\n          ' + validator.compile() + '\n\n          if (accumulatedErrorCount === errors.length) {\n            notValid = false\n          }\n\n          if (notValid === true) {\n            valid = initialValidity\n            errors = errors.slice(0, initialErrorCount)\n          } else {\n            valid = false\n            errors = errors.slice(0, initialErrorCount)\n            errors.push({\n              keyword: \'not\',\n              message: \'hmm...\'\n            })\n          }\n        }\n      ';
      }

      return block;
    }

    /**
     * properties
     *
     * @description
     * Iterate over the `properties` schema property if it is an object. For each
     * key, initialize a new Validator for the subschema represented by the property
     * value and invoke compile. Append the result of compiling each subschema to
     * the block of code being generated.
     *
     * @returns {string}
     */

  }, {
    key: 'properties',
    value: function properties() {
      var schema = this.schema,
          address = this.address;
      var properties = schema.properties,
          required = schema.required;

      var block = this.push();

      // ensure the value of "required" schema property is an array
      required = Array.isArray(required) ? required : [];

      if ((typeof properties === 'undefined' ? 'undefined' : _typeof(properties)) === 'object') {
        Object.keys(properties).forEach(function (key) {
          var subschema = properties[key];
          var isRequired = required.indexOf(key) !== -1;
          // TODO
          // how should we be calculating these things? should be json pointer?
          // needs a separate function
          var pointer = [address, key].filter(function (segment) {
            return !!segment;
          }).join('.');
          var validation = new Validator(subschema, { address: pointer, require: isRequired });

          // read the value
          block += '\n        value = container[\'' + key + '\']\n        ';

          block += validation.compile();
        });
      }

      block += this.pop();

      return block;
    }

    /**
     * Other Properties
     *
     * @description
     * This method is not for a keyword. It wraps validations for
     * patternProperties and additionalProperties in a single iteration over
     * an object-type value's properties.
     *
     * It should only be invoked once for a given subschema.
     *
     * @returns {string}
     */

  }, {
    key: 'otherProperties',
    value: function otherProperties() {
      return '\n      /**\n       * Validate Other Properties\n       */\n      ' + this.push() + '\n\n      for (let key in container) {\n        value = container[key]\n        matched = false\n\n        ' + this.patternValidations() + '\n        ' + this.additionalValidations() + '\n      }\n\n      ' + this.pop() + '\n    ';
    }

    /**
     * Pattern Validations
     *
     * @description
     * Generate validation code from a subschema for properties matching a
     * regular expression.
     *
     * @returns {string}
     */

  }, {
    key: 'patternValidations',
    value: function patternValidations() {
      var patternProperties = this.schema.patternProperties;

      var block = '';

      if ((typeof patternProperties === 'undefined' ? 'undefined' : _typeof(patternProperties)) === 'object') {
        Object.keys(patternProperties).forEach(function (pattern) {
          var subschema = patternProperties[pattern];
          var validator = new Validator(subschema);
          block += '\n          if (key.match(\'' + pattern + '\')) {\n            matched = true\n            ' + validator.compile() + '\n          }\n        ';
        });
      }

      return block;
    }

    /**
     * Additional Validations
     *
     * @description
     * Generate validation code, either from a subschema for properties not
     * defined in the schema, or to disallow properties not defined in the
     * schema.
     *
     * @returns {string}
     */

  }, {
    key: 'additionalValidations',
    value: function additionalValidations() {
      var _schema = this.schema,
          properties = _schema.properties,
          additionalProperties = _schema.additionalProperties,
          address = this.address;

      var validations = '';
      var block = '';

      // catch additional unmatched properties
      var conditions = ['matched !== true'];

      // ignore defined properties
      Object.keys(properties || {}).forEach(function (key) {
        conditions.push('key !== \'' + key + '\'');
      });

      // validate additional properties
      if ((typeof additionalProperties === 'undefined' ? 'undefined' : _typeof(additionalProperties)) === 'object') {
        var subschema = additionalProperties;
        var validator = new Validator(subschema, { address: address + '[APKey]' });
        block += '\n        // validate additional properties\n        if (' + conditions.join(' && ') + ') {\n          ' + validator.compile() + '\n        }\n      ';
      }

      // error for additional properties
      if (additionalProperties === false) {
        block += '\n        // validate non-presence of additional properties\n        if (' + conditions.join(' && ') + ') {\n          valid = false\n          errors.push({\n            keyword: \'additionalProperties\',\n            message: key + \' is not a defined property\'\n          })\n        }\n      ';
      }

      return block;
    }

    /**
     * patternProperties
     *
     * @description
     * Generate validation code for properties matching a pattern
     * defined by the property name (key), which must be a string
     * representing a valid regular expression.
     *
     * @returns {string}
     */

  }, {
    key: 'patternProperties',
    value: function patternProperties() {
      var block = '';

      if (!this.otherPropertiesCalled) {
        this.otherPropertiesCalled = true;
        block += this.otherProperties();
      }

      return block;
    }

    /**
     * additionalProperties
     *
     * @description
     * Generate validation code for additional properties not defined
     * in the schema, or disallow additional properties if the value of
     * `additionalProperties` in the schema is `false`.
     *
     * @returns {string}
     */

  }, {
    key: 'additionalProperties',
    value: function additionalProperties() {
      var block = '';

      if (!this.otherPropertiesCalled) {
        this.otherPropertiesCalled = true;
        block += this.otherProperties();
      }

      return block;
    }

    /**
     * minProperties
     *
     * @description
     * > An object instance is valid against "minProperties" if its number of
     * > properties is greater than, or equal to, the value of this keyword.
     * > JSON Schema Validation Section 5.4.2
     *
     * @returns {string}
     */

  }, {
    key: 'minProperties',
    value: function minProperties() {
      var minProperties = this.schema.minProperties,
          address = this.address;


      return '\n        // ' + address + ' min properties\n        if (Object.keys(value).length < ' + minProperties + ') {\n          valid = false\n          errors.push({\n            keyword: \'minProperties\',\n            message: \'too few properties\'\n          })\n        }\n    ';
    }

    /**
     * maxProperties
     *
     * @description
     * > An object instance is valid against "maxProperties" if its number of
     * > properties is less than, or equal to, the value of this keyword.
     * > JSON Schema Validation Section 5.4.1
     *
     * @returns {string}
     */

  }, {
    key: 'maxProperties',
    value: function maxProperties() {
      var maxProperties = this.schema.maxProperties,
          address = this.address;


      return '\n        // ' + address + ' max properties\n        if (Object.keys(value).length > ' + maxProperties + ') {\n          valid = false\n          errors.push({\n            keyword: \'maxProperties\',\n            message: \'too many properties\'\n          })\n        }\n    ';
    }

    /**
     * Dependencies
     *
     * @description
     * > For all (name, schema) pair of schema dependencies, if the instance has
     * > a property by this name, then it must also validate successfully against
     * > the schema.
     * >
     * > Note that this is the instance itself which must validate successfully,
     * > not the value associated with the property name.
     * >
     * > For each (name, propertyset) pair of property dependencies, if the
     * > instance has a property by this name, then it must also have properties
     * > with the same names as propertyset.
     * > JSON Schema Validation Section 5.4.5.2
     *
     * @returns {string}
     */

  }, {
    key: 'dependencies',
    value: function dependencies() {
      var dependencies = this.schema.dependencies,
          address = this.address;


      var block = this.push();

      if ((typeof dependencies === 'undefined' ? 'undefined' : _typeof(dependencies)) === 'object') {
        Object.keys(dependencies).forEach(function (key) {
          var dependency = dependencies[key];
          var conditions = [];

          if (Array.isArray(dependency)) {
            dependency.forEach(function (item) {
              conditions.push('container[\'' + item + '\'] === undefined');
            });

            block += '\n            if (container[\'' + key + '\'] !== undefined && (' + conditions.join(' || ') + ')) {\n              valid = false\n              errors.push({\n                keyword: \'dependencies\',\n                message: \'unmet dependencies\'\n              })\n            }\n          ';
          } else if ((typeof dependency === 'undefined' ? 'undefined' : _typeof(dependency)) === 'object') {
            var subschema = dependency;
            var validator = new Validator(subschema, { address: address });

            block += '\n            if (container[\'' + key + '\'] !== undefined) {\n              ' + validator.compile() + '\n            }\n          ';
          }
        });
      }

      block += this.pop();

      return block;
    }

    /**
     * Required
     *
     * @description
     * > An object instance is valid against this keyword if its property set
     * > contains all elements in this keyword's array value.
     * > JSON Schema Validation Section 5.4.3
     *
     * @returns {string}
     */

  }, {
    key: 'required',
    value: function required() {
      var properties = this.schema.properties,
          address = this.address;

      var block = '';

      block += '\n      // validate ' + address + ' presence\n      if (value === undefined) {\n        valid = false\n        errors.push({\n          keyword: \'required\',\n          message: \'is required\'\n        })\n      }\n    ';

      return block;
    }

    /**
     * additionalItems
     *
     * @description
     * > Successful validation of an array instance with regards to these two
     * > keywords is determined as follows: if "items" is not present, or its
     * > value is an object, validation of the instance always succeeds,
     * > regardless of the value of "additionalItems"; if the value of
     * > "additionalItems" is boolean value true or an object, validation of
     * > the instance always succeeds; if the value of "additionalItems" is
     * > boolean value false and the value of "items" is an array, the
     * > instance is valid if its size is less than, or equal to, the size
     * > of "items".
     * > JSON Schema Validation Section 5.3.1
     *
     * @returns {string}
     */

  }, {
    key: 'additionalItems',
    value: function additionalItems() {
      var _schema2 = this.schema,
          items = _schema2.items,
          additionalItems = _schema2.additionalItems,
          address = this.address;

      var block = '';

      if (additionalItems === false && Array.isArray(items)) {
        block += '\n        // don\'t allow additional items\n        if (value.length > ' + items.length + ') {\n          valid = false\n          errors.push({\n            keyword: \'additionalItems\',\n            message: \'additional items not allowed\'\n          })\n        }\n      ';
      }

      if ((typeof additionalItems === 'undefined' ? 'undefined' : _typeof(additionalItems)) === 'object' && additionalItems !== null && Array.isArray(items)) {
        var subschema = additionalItems;
        var validator = new Validator(subschema);

        block += '\n        // additional items\n        ' + this.push() + '\n\n        for (var i = ' + items.length + '; i <= container.length; i++) {\n          value = container[i]\n          ' + validator.compile() + '\n        }\n\n        ' + this.pop() + '\n      ';
      }

      return block;
    }

    /**
     * Items
     *
     * @description
     * > Successful validation of an array instance with regards to these two
     * > keywords is determined as follows: if "items" is not present, or its
     * > value is an object, validation of the instance always succeeds,
     * > regardless of the value of "additionalItems"; if the value of
     * > "additionalItems" is boolean value true or an object, validation of
     * > the instance always succeeds; if the value of "additionalItems" is
     * > boolean value false and the value of "items" is an array, the
     * > instance is valid if its size is less than, or equal to, the size
     * > of "items".
     * > JSON Schema Validation Section 5.3.1
     *
     * Code to generate
     *
     *     // this outer conditional is generated by this.array()
     *     if (Array.isArray(value) {
     *       let parent = value
     *       for (let i = 0; i < parent.length; i++) {
     *         value = parent[i]
     *         // other validation code depending on value here
     *       }
     *       value = parent
     *     }
     *
     *
     * @returns {string}
     */

  }, {
    key: 'items',
    value: function items() {
      var items = this.schema.items,
          address = this.address;

      var block = '';

      // if items is an array
      if (Array.isArray(items)) {
        block += this.push();

        items.forEach(function (item, index) {
          var subschema = item;
          var validator = new Validator(subschema, { address: address + '[' + index + ']' });

          block += '\n          // item #' + index + '\n          value = container[' + index + ']\n          ' + validator.compile() + '\n        ';
        });

        block += this.pop();

        // if items is an object
      } else if ((typeof items === 'undefined' ? 'undefined' : _typeof(items)) === 'object' && items !== null) {
        var subschema = items;
        var validator = new Validator(subschema);

        block += '\n        // items\n        ' + this.push() + '\n\n        for (var i = 0; i < container.length; i++) {\n          // read array element\n          value = container[i]\n          ' + validator.compile() + '\n        }\n\n        ' + this.pop() + '\n      ';
      }

      return block;
    }

    /**
     * minItems
     *
     * @description
     * > An array instance is valid against "minItems" if its size is greater
     * > than, or equal to, the value of this keyword.
     * > JSON Schema Validation Section 5.3.3
     *
     * @returns {string}
     */

  }, {
    key: 'minItems',
    value: function minItems() {
      var minItems = this.schema.minItems,
          address = this.address;


      return '\n        // ' + address + ' min items\n        if (value.length < ' + minItems + ') {\n          valid = false\n          errors.push({\n            keyword: \'minItems\',\n            message: \'too few properties\'\n          })\n        }\n    ';
    }

    /**
     * maxItems
     *
     * @description
     * > An array instance is valid against "maxItems" if its size is less
     * > than, or equal to, the value of this keyword.
     * > JSON Schema Validation Section 5.3.2
     *
     * @returns {string}
     */

  }, {
    key: 'maxItems',
    value: function maxItems() {
      var maxItems = this.schema.maxItems,
          address = this.address;


      return '\n        // ' + address + ' max items\n        if (value.length > ' + maxItems + ') {\n          valid = false\n          errors.push({\n            keyword: \'maxItems\',\n            message: \'too many properties\'\n          })\n        }\n    ';
    }

    /**
     * uniqueItems
     *
     * @description
     * > If this keyword has boolean value false, the instance validates
     * > successfully. If it has boolean value true, the instance validates
     * > successfully if all of its elements are unique.
     * > JSON Schema Validation Section 5.3.4
     *
     * TODO
     * optimize
     *
     * @returns {string}
     */

  }, {
    key: 'uniqueItems',
    value: function uniqueItems() {
      var uniqueItems = this.schema.uniqueItems,
          address = this.address;

      var block = '';

      if (uniqueItems === true) {
        block += '\n        // validate ' + address + ' unique items\n        let values = value.map(v => JSON.stringify(v)) // TODO: optimize\n        let set = new Set(values)\n        if (values.length !== set.size) {\n          valid = false\n          errors.push({\n            keyword: \'uniqueItems\',\n            message: \'items must be unique\'\n          })\n        }\n      ';
      }

      return block;
    }

    /**
     * minLength
     *
     * @description
     * > A string instance is valid against this keyword if its length is
     * > greater than, or equal to, the value of this keyword. The length of
     * > a string instance is defined as the number of its characters as
     * > defined by RFC 4627 [RFC4627].
     * > JSON Schema Validation Section 5.2.2
     *
     * @returns {string}
     */

  }, {
    key: 'minLength',
    value: function minLength() {
      var minLength = this.schema.minLength,
          address = this.address;


      return '\n        // ' + address + ' validate minLength\n        if (Array.from(value).length < ' + minLength + ') {\n          valid = false\n          errors.push({\n            keyword: \'minLength\',\n            message: \'too short\'\n          })\n        }\n    ';
    }

    /**
     * maxLength
     *
     * @description
     * > A string instance is valid against this keyword if its length is less
     * > than, or equal to, the value of this keyword. The length of a string
     * > instance is defined as the number of its characters as defined by
     * > RFC 4627 [RFC4627].
     * > JSON Schema Validation Section 5.2.1
     *
     * @returns {string}
     */

  }, {
    key: 'maxLength',
    value: function maxLength() {
      var maxLength = this.schema.maxLength,
          address = this.address;


      return '\n        // ' + address + ' validate maxLength\n        if (Array.from(value).length > ' + maxLength + ') {\n          valid = false\n          errors.push({\n            keyword: \'maxLength\',\n            message: \'too long\'\n          })\n        }\n    ';
    }

    /**
     * Pattern
     *
     * @description
     * > A string instance is considered valid if the regular expression
     * > matches the instance successfully.
     * > JSON Schema Validation Section 5.2.3
     *
     * @returns {string}
     */

  }, {
    key: 'pattern',
    value: function pattern() {
      var pattern = this.schema.pattern,
          address = this.address;


      if (pattern) {
        return '\n          // ' + address + ' validate pattern\n          if (!value.match(new RegExp(\'' + pattern + '\'))) {\n            valid = false\n            errors.push({\n              keyword: \'pattern\',\n              message: \'does not match the required pattern\'\n            })\n          }\n      ';
      }
    }

    /**
     * Format
     *
     * @description
     * > Structural validation alone may be insufficient to validate that
     * > an instance meets all the requirements of an application. The
     * > "format" keyword is defined to allow interoperable semantic
     * > validation for a fixed subset of values which are accurately
     * > described by authoritative resources, be they RFCs or other
     * > external specifications.
     * > JSON Schema Validation Section 7.1
     *
     * @returns {string}
     */

  }, {
    key: 'format',
    value: function format() {
      var format = this.schema.format,
          address = this.address;

      var matcher = formats.resolve(format);

      if (matcher) {
        return '\n      // ' + address + ' validate format\n      if (!value.match(' + matcher + ')) {\n        valid = false\n        errors.push({\n          keyword: \'format\',\n          message: \'is not "' + format + '" format\'\n        })\n      }\n      ';
      }
    }

    /**
     * Minimum
     *
     * @description
     * > Successful validation depends on the presence and value of
     * > "exclusiveMinimum": if "exclusiveMinimum" is not present, or has
     * > boolean value false, then the instance is valid if it is greater
     * > than, or equal to, the value of "minimum"; if "exclusiveMinimum" is
     * > present and has boolean value true, the instance is valid if it is
     * > strictly greater than the value of "minimum".
     * > JSON Schema Validation Section 5.1.3
     *
     * @returns {string}
     */

  }, {
    key: 'minimum',
    value: function minimum() {
      var _schema3 = this.schema,
          minimum = _schema3.minimum,
          exclusiveMinimum = _schema3.exclusiveMinimum,
          address = this.address;

      var operator = exclusiveMinimum === true ? '<=' : '<';

      return '\n        // ' + address + ' validate minimum\n        if (value ' + operator + ' ' + minimum + ') {\n          valid = false\n          errors.push({\n            keyword: \'minimum\',\n            message: \'too small\'\n          })\n        }\n    ';
    }

    /**
     * Maximum
     *
     * @description
     * > Successful validation depends on the presence and value of
     * > "exclusiveMaximum": if "exclusiveMaximum" is not present, or has
     * > boolean value false, then the instance is valid if it is lower than,
     * > or equal to, the value of "maximum"; if "exclusiveMaximum" has
     * > boolean value true, the instance is valid if it is strictly lower
     * > than the value of "maximum".
     * > JSON Schema Validation Section 5.1.2
     *
     * @returns {string}
     */

  }, {
    key: 'maximum',
    value: function maximum() {
      var _schema4 = this.schema,
          maximum = _schema4.maximum,
          exclusiveMaximum = _schema4.exclusiveMaximum,
          address = this.address;

      var operator = exclusiveMaximum === true ? '>=' : '>';

      return '\n        // ' + address + ' validate maximum\n        if (value ' + operator + ' ' + maximum + ') {\n          valid = false\n          errors.push({\n            keyword: \'maximum\',\n            message: \'too large\'\n          })\n        }\n    ';
    }

    /**
     * multipleOf
     *
     * @description
     * > A numeric instance is valid against "multipleOf" if the result of
     * > the division of the instance by this keyword's value is an integer.
     * > JSON Schema Validation Section 5.1.1
     *
     * @returns {string}
     */

  }, {
    key: 'multipleOf',
    value: function multipleOf() {
      var multipleOf = this.schema.multipleOf;

      var block = '';

      if (typeof multipleOf === 'number') {
        var length = multipleOf.toString().length;
        var decimals = length - multipleOf.toFixed(0).length - 1;
        var pow = decimals > 0 ? Math.pow(10, decimals) : 1;
        var condition = void 0;

        if (decimals > 0) {
          condition = '(value * ' + pow + ') % ' + multipleOf * pow + ' !== 0';
        } else {
          condition = 'value % ' + multipleOf + ' !== 0';
        }

        block += '\n        if (' + condition + ') {\n          valid = false\n          errors.push({\n            keyword: \'multipleOf\',\n            message: \'must be a multiple of ' + multipleOf + '\'\n          })\n        }\n      ';
      }

      return block;
    }
  }]);

  return Validator;
}();

/**
 * Export
 */


module.exports = Validator;