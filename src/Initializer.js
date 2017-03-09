'use strict'

/**
 * Initializer
 */
class Initializer {

  /**
   * constructor
   */
  constructor (schema, options) {
    Object.assign(this, options || {})
    this.root = this.root || this

    this.root.depth = this.root.depth || 1

    if (this.level > this.root.depth) {
      this.root.depth = this.level
    }

    this.level = this.level || 0
    this.schema = schema
  }

  /**
   * compile (static)
   */
  static compile (schema) {
    let initializer = new Initializer(schema)
    let block = initializer.compile()

    //console.log(beautify(block))
    try {
      return new Function('target', 'source', 'options', block)
    } catch (e) {
      console.log(e, e.stack)
    }
  }

  /**
   * compile
   */
  compile () {
    let { root, depth, level } = this
    let declarations = ``
    let body = ``

    // traverse the schema and generate code
    body += this.default()
    body += this.properties()
    //body += this.additionalProperties()
    body += this.items()
    //body += this.additionalItems()


    // value
    body += this.member()
    body += this.item()

    // after traversing the schema
    // generate the variable declarations
    if (root === this) {
      for (let i = 1; i <= this.root.depth; i++) {
        declarations += this.declaration(i)
      }

      return `
        options = options || {}

        if (options.filter === false) {
          Object.assign(target, JSON.parse(JSON.stringify(source)))
        }

        ${ declarations }
        ${ body }
      `
    }

    return body

  }

  /**
   * declaration
   */
  declaration (level) {
    return `
      var target${ level }
      var source${ level }
      var count${ level }
    `
  }

  /**
   * default
   */
  default () {
    let { schema, level, key, index } = this
    let { default: value } = schema       // rename default to value because it's a keyword and syntax highlighter breaks
    let block = ``

    if (schema.hasOwnProperty('default')) {

      if (key) {
        block += `
          target${ level }['${ key }'] = ${ JSON.stringify(value) }
        `
      }

      if (index) {
        block += `
          target${ level }[${ index }] = ${ JSON.stringify(value) }
        `
      }

      if (level > 1) {
        block += `
          count${ level }++
        `
      }

      block = `
        if (options.defaults !== false) {
          ${ block }
        }
      `
    }

    return block
  }


  /**
   * member
   */
  member () {
    let { schema, root, level, key } = this
    let { properties, additionalProperties, items, additionalItems } = schema
    let block = ``

    // `key` tells us to treat this subschema as an object member vs an array item
    // and the absence of the other values here indicates we are dealing with a
    // primitive value
    if (key && !properties && !additionalProperties && !items && !additionalItems) {

      // first generate the assignment statement
      block += `
        target${ level }['${ key }'] = source${ level }['${ key }']
      `

      // for nested container objects, add the counter incrementing statement
      if (level > 1) {
        block += `
          count${ level }++
        `
      }

      // wrap the foregoing in a check for presence on the source
      block = `
        if (source${ level }.hasOwnProperty('${ key }')) {
          ${ block }
        }
      `
    }

    return block
  }

  /**
   * item
   */
  item () {
    let { schema, root, level, index } = this
    let { properties, additionalProperties, items, additionalItems } = schema
    let block = ``

    if (index && !properties && !additionalProperties && !items && !additionalItems) {

      block += `
        target${ level }[${ index }] = source${ level }[${ index }]
      `

      if (level > 1) {
        block += `
          count${ level }++
        `
      }

      block = `
        if (${ index } < len) {
          ${ block }
        }
      `

    }

    return block
  }

  /**
   * properties
   */
  properties () {
    let { schema, root, level, key, index } = this
    let { properties } = schema
    let block = ``

    if (properties) {
      Object.keys(properties).forEach(key => {
        let subschema = properties[key]
        let initializer = new Initializer(subschema, { key, root, level: level + 1 })

        block += initializer.compile()
      })

      // root-level properties boilerplate
      if (root === this) {
        block = `
          if (typeof source === 'object' && source !== null && !Array.isArray(source)) {
            if (typeof target !== 'object') {
              throw new Error('?')
            }

            source1 = source
            target1 = target
            count1 = 0

            ${ block }
          }
        `

      // nested properties boilerplate
      } else {

        if (index) {
          block = `
            if (${ index } < source${ level }.length || typeof source${ level }[${ index }] === 'object') {

              source${ level + 1 } = source${ level }[${ index }] || {}
              count${ level + 1 } = 0

              if (${ index } < target${ level }.length || typeof target${ level }[${ index }] !== 'object') {
                target${ level + 1 } = {}
                if (${ index } < source${ level }.length) {
                  count${ level + 1 }++
                }
              } else {
                target${ level + 1 } = target${ level }[${ index }]
              }

              ${ block }

              if (count${ level + 1 } > 0) {
                target${ level }[${ index }] = target${ level + 1 }
                count${ level }++
              }

            } else {
              target${ level }[${ index }] = source${ level }[${ index }]
              count${ level }++
            }
          `
        }

        if (key) {
          block = `
            if ((typeof source${ level }['${ key }'] === 'object'
                  && source${level}['${key}'] !== null
                  && !Array.isArray(source${level}['${key}']))
                || !source${ level }.hasOwnProperty('${ key }')) {

              source${ level + 1 } = source${ level }['${ key }'] || {}
              count${ level + 1 } = 0

              if (!target${ level }.hasOwnProperty('${ key }')
                  || typeof target${ level }['${ key }'] !== 'object'
                  || target${level}['${ key }'] === null
                  || Array.isArray(target${ level }['${ key }'])) {
                target${ level + 1 } = {}
                if (source${ level }.hasOwnProperty('${ key }')) {
                  count${ level + 1 }++
                }
              } else {
                target${ level + 1 } = target${ level }['${ key }']
                count${ level + 1 }++
              }

              ${ block }

              if (count${ level + 1 } > 0) {
                target${ level }['${ key }'] = target${ level + 1 }
                count${ level }++
              }

            } else {
              target${ level }['${ key }'] = source${ level }['${ key }']
              count${ level }++
            }
          `
        }
      }
    }

    return block
  }

  /**
   *
   */
  additionalProperties () {}

  /**
   * items
   */
  items () {

    let { schema, root, level, key, index } = this
    let { items } = schema
    let block = ``

    if (items) {

      if (Array.isArray(items)) {
        // TODO
        //
        //
        //
        //
        //
        // ...

      } else if (typeof items === 'object' && items !== null) {
        let index = `i${ level + 1 }`
        let initializer = new Initializer(items, { index, root, level: level + 1 })

        block += `
          var sLen = source${ level + 1 }.length || 0
          var tLen = target${ level + 1 }.length || 0
          var len = 0

          if (sLen > len) { len = sLen }
          // THIS IS WRONG, CAUSED SIMPLE ARRAY INIT TO FAIL (OVERWRITE
          // EXISTING TARGET VALUES WITH UNDEFINED WHEN SOURCE IS SHORTER THAN
          // TARGET). LEAVING HERE UNTIL WE FINISH TESTING AND SEE WHY IT MIGHT
          // HAVE BEEN HERE IN THE FIRST PLACE.
          //
          // if (tLen > len) { len = tLen }

          for (var ${ index } = 0; ${ index } < len; ${ index }++) {
            ${ initializer.compile() }
          }
        `
      }

      // root-level properties boilerplate
      if (root === this) {
        block = `
          if (Array.isArray(source)) {
            if (!Array.isArray(target)) {
              throw new Error('?')
            }

            source1 = source
            target1 = target

            ${ block }
          }
        `

      // nested properties boilerplate
      } else {
        block = `
          if (Array.isArray(source${ level }['${ key }']) || !source${ level }.hasOwnProperty('${ key }')) {

            source${ level + 1 } = source${ level }['${ key }'] || []
            count${ level + 1 } = 0

            if (!target${ level }.hasOwnProperty('${ key }') || !Array.isArray(target${ level }['${ key }'])) {
              target${ level + 1 } = []
                if (source${ level }.hasOwnProperty('${ key }')) {
                  count${ level + 1 }++
                }

            } else {
              target${ level + 1 } = target${ level }['${ key }']
              count${ level + 1 }++
            }

            ${ block }

            if (count${ level + 1 } > 0) {
              target${ level }['${ key }'] = target${ level + 1 }
              count${ level }++
            }

          } else {
            target${ level }['${ key }'] = source${ level }['${ key }']
            count${ level }++
          }
        `
      }
    }

    return block
  }

  /**
   *
   */
  additionalItems () {}

}

module.exports = Initializer
