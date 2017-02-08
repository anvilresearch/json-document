/**
 * GRAMMAR
 * INPUT GRAMMAR
 *  properties
 *  additionalProperties
 *  items
 *  additionalItems
 *  default
 *
 * OUTPUT GRAMMAR
 *
 *  container :=
 *    { declaration } member { member }
 *
 *  member :=
 *    [ optionalDefault ] sourceTest
 *
 *  sourceTest :=
 *    sourceValue | assignTargetPrimativeFromSource incrementCounter
 *
 *  sourceValue :=
 *    ensureNestedTargetContainer assignNestedSource initializeCounter container attachNestedTargetContainer
 *
 *  optionalDefault :=
 *    assignDefaultValueToTarget incrementCounter
 *
 *  attachNestedTargetContainer :=
 *    attachTargetContainer incrementParentCounter
 *
 *  ensureNestedTargetContainer :=
 *    ( testTargetParentHasArrayItem | testTargetParentHasOwnProperty ) 
 *    ( testTargetIsArray | testTargetIsObject )
 *    ( newArrayContainer | newObjectContainer )
 *
 *  These are not up to date
 *  ------------------------ 
 *  testTargetParentHasArrayItem
 *  testTargetParentHasOwnProperty
 *  testTargetIsArray
 *  testTargetIsObject
 *  newArrayContainer
 *  newObjectContainer
 *  assignTargetContainerFromSource
 *  ensureNestedTargetContainer
 *  assignNestedSource
 *  initializeCounter
 *  assignTargetPrimativeFromSource
 *  incrementCounter
 *  assignDefaultValueToTarget
 *  attachTargetContainer
 *  declaration
 */




class Initializer2 {

  /**
   * compile (static)
   */
  static compile (schema) {}

  /**
   * compile
   * 
   * @returns {String}
   */
  compile () {
    let declarations = `
      var source0 = source
      var target0 = target
      var count0 = 0

    `
    let body = this.container()

    let { level, depth } = this
    if (level === 0) {
      for (i = 0; i < depth - 1; i++) {
        declarations += this.declaration(i)
      }
    }

    return `
      ${declarations}
      ${body}
    `
  }

  /**
   * Composite elements
   */

  /**
   * container
   */
  container () {
    let { schema, root, level } = this
    let { properties } = schema
    let block = ''

    // TODO More here. Doing properties for now
    // Array, etc. should be in here as well.
    // Provision for additionalProperties and additionalItems
    // should happen in the compiler itself.
    if (properties) {
      Object.keys(properties).forEach(key => {
        let subschema = properties[key]
        let initializer = new Initializer(subschema, { root, level + 1 })

        block += initializer.member()
      })
    }

    return block
  }

  /**
   * declaration
   */
  declaration (level) {
    return `
      var source${ level }
      var target${ level }
      var count${ level }

    `
  }

  /**
   * member
   */
  member () {
    let block = ''

    if (/* Something here */) {
      block += this.optionalDefault()
    }

    block += this.sourceTest()

    return block
  }

  /**
   * sourceTest
   */
  sourceTest () {
    let { level, key, parentType, type } = this
    
    let presenceTest = parentType === 'object'
      ? this.testSourceParentHasOwnProperty()
      : this.testSourceParentHasArrayItem()

    let value
    if (type === 'object' || type === 'array') {
      value = this.sourceValue()
    } else {
      value = `
        ${ this.assignTargetPrimativeFromSource() }
        ${ this.incrementCounter() }
      `
    }

    return `
      if (${ presenceTest }) {
        ${ value }
      }
    `
  }

  /**
   * sourceValue
   */
  sourceValue () {
    let { level, key, parentType } = this

    let typeTest = parentType === 'object'
      ? this.testSourceIsObject()
      : this.testSourceIsArray()

    return `
      if (${ typeTest }) {
        ${ this.ensureNestedTargetContainer() }
        ${ this.assignNestedSource() }
        ${ this.initializeCounter() }
        ${ /* Recurse here */ }
        ${ this.attachNestedTargetContainer() }
      } else {
        ${ this.assignTargetContainerFromSource() }
        ${ this.incrementParentCounter() }
      }
    `
  }

  /**
   * ensureNestedTargetContainer
   *
   * @returns {String}
   */
  ensureNestedTargetContainer () {
    let { level, key, parentType, type } = this

    let presenceTest = parent.type === 'object'
      ? this.testTargetParentHasOwnProperty()
      : this.testTargetParentHasArrayItem()

    let typeTest, containerType
    if (type === 'object') {
      typeTest = this.testTargetIsObject()
      containerType = this.newObjectContainer()
    } else {
      typeTest = this.testTargetIsArray()
      containerType = this.newArrayContainer()
    }

    return `
      if (${ presenceTest } || ${ typeTest }) {
        ${ containerType }
      } else {
        target${ level } = target${ level - 1 }['${ key }']
      }
    `
  }

  /**
   * optionalDefault
   */
  optionalDefault () {
    return `
      if (options.defaults !== false) {
        ${ this.assignDefaultValueToTarget() }
        ${ this.incrementCounter() }
      }
    `
  }

  /**
   * attachNestedTargetContainer
   */
  attachNestedTargetContainer () {
    let { level, key } = this

    return `
      if (count${ level } > 0) {
        ${ this.attachTargetContainer() }
        ${ this.incrementParentCounter() }
      }
    `
  }

  /**
   * Leaf elements
   */

  /**
   * assignDefaultValueToTarget
   *
   * @returns {String}
   */
  assignDefaultValueToTarget () {
    let { level, key } = this
    let value = JSON.stringify(this.default)

    return `target${ level }['${ key }'] = ${ value }`
  }

  /**
   * assignNestedSource
   *
   * @returns {String}
   */
  assignNestedSource () {
    let { level, key } = this

    return `source${ level } = source${ level - 1 }['${ key }']`
  }

  /**
   * assignTargetContainerFromSource
   * 
   * @returns {String}
   */
  assignTargetContainerFromSource () {
    let { level, key } = this

    return `target${ level - 1 }[${ key }] = source${ level }`
  }

  /**
   * assignTargetPrimativeFromSource
   *
   * @returns {String}
   */
  assignTargetPrimativeFromSource () {
    let { level, key } = this

    return `target${ level }['${ key }'] = source${ level }['${ key }']`
  }

  /**
   * attachTargetContainer
   *
   * @returns {String}
   */
  attachTargetContainer () {
    let { level, key } = this

    return `target${ level - 1 }[${ key }] = target${ level }`
  }

  /**
   * incrementCounter
   *
   * @returns {String}
   */
  incrementCounter () {
    let { level } = this

    return `count${ level }++`
  }

  /**
   * incrementParentCounter
   *
   * @returns {String}
   */
  incrementParentCounter () {
    let { level } = this

    return `count${ level - 1 }++`
  }

  /**
   * initializeCounter
   * 
   * @returns {String}
   */
  initializeCounter () {
    let { level } = this

    return `count${ level } = 0`
  }

  /**
   * newArrayContainer
   * 
   * @returns {String}
   */
  newArrayContainer () {
    let { level } = this

    return `target${ level } = []`
  }

  /**
   * newObjectContainer
   * 
   * @returns {String}
   */
  newObjectContainer () {
    let { level } = this

    return `target${ level } = {}`
  }

  /**
   * testSourceParentHasArrayItem
   * 
   * @returns {String}
   */
  testSourceParentHasArrayItem () {
    let { level, key } = this

    return `${ key } < target${ level - 1 }.length`
  }

  /**
   * testSourceParentHasOwnProperty
   * 
   * @returns {String}
   */
  testSourceParentHasOwnProperty () {
    let { level, key } = this

    return `source${ level - 1 }.hasOwnProperty('${ key }')`
  }

  /**
   * testTargetParentHasArrayItem
   * 
   * @returns {String}
   */
  testTargetParentHasArrayItem () {
    let { level, key } = this

    return `${ key } >= target${ level - 1 }.length`
  }

  /**
   * testTargetParentHasOwnProperty
   * 
   * @returns {String}
   */
  testTargetParentHasOwnProperty () {
    let { level, key } = this

    return `!target${ level - 1 }.hasOwnProperty('${ key }')`
  }

  /**
   * testSourceIsArray
   * 
   * @returns {String}
   */
  testSourceIsArray () {
    let { level, key } = this

    return `!Array.isArray(source${ level - 1 }[${ key }]`
  }

  /**
   * testSourceIsObject
   * 
   * @returns {String}
   */
  testSourceIsObject () {
    let { level, key } = this

    return `typeof source${ level - 1 }['${ key }'] !== 'object'`
  }

  /**
   * testTargetIsArray
   * 
   * @returns {String}
   */
  testTargetIsArray () {
    let { level, key } = this

    return `!Array.isArray(target${ level - 1 }[${ key }]`
  }

  /**
   * testTargetIsObject
   * 
   * @returns {String}
   */
  testTargetIsObject () {
    let { level, key } = this

    return `typeof target${ level - 1 }['${ key }'] !== 'object'`
  }

}











class Initializer {

  /**
   * compile
   */
  static compile (schema) {
    let initializer = new Initializer(schema)
    let body = initializer.compile()
    return new Function(’target’, ‘source’, ‘options’, body)
  }

  /**
   * compile
   */
  compile () {
    let block = ``

    block += this.items()
    block += this.properties()
  }

  /**
   * properties
   */
  properties () {
    let block = ``

    if (subschema.properties) {
      Object.keys(subschema.properties).forEach(key => {
        // create a new compiler for the nested object and invoke compile?
        block += initializer.compile()
      })
    }

    return block
  }

  /**
   * additionalProperties
   */
  additionalProperties () {}

  /**
   * items
   */
  items () {}

  /**
   * additionalItems
   */
  additionalItems () {}

  /**
   * sourceHasOwnProperty
   */
  sourceHasOwnProperty () {
    let block = ``

    if (subschema.properties) {
      block += this.sourceValueIsObject()
      block += this.sourceValueIsNotObject()
    } else {
      block += this.assignSourceValueToTarget()
      block += this.incrementCounter()
    }

    return `
      if (source${depth}.hasOwnProperty(“${key}”)) {
        ${block}
      }
    `
  }

  /**
   * sourceValueIsObject
   */
  sourceValueIsObject () {
    let block = ``

    block += this.ensureNestedTargetContainerObject()
    block += this.assignNestedSourceObject()
    block += this.initializeCounter()

		// this is where we create a new compiler to recurse?
    block += this.properties()

    return `
      if (typeof source${depth}[“${key}”] === ‘object’) {
        ${block}
      }
    `
  }

  /**
   * sourceValueIsNotObject
   */
  sourceValueIsNotObject () {
    let block = ``

    block += this.assignSourceValueToTarget()
    block += this.incrementCounter()

    return `
      else {
        ${block}
      }
    `
  }

  /**
   * ensureNestedTargetContainerObject
   */
  ensureNestedTargetContainerObject () {
    return `
      if (!target${depth}.hasOwnProperty(‘${key}’) || typeof target${depth}[‘${key}’] !== ‘object’) {
        ${ this.createNestedTargetContainerObject() }
      } else {
        ${ this.assignNestedTargetContainerObject() }
      }
    `
  }

  /**
   * createNestedTargetContainerObject
   */
  createNestedTargetContainerObject () {
    return `target${depth} = {}`
  }

  /**
   * assignNestedTargetContainerObject
   */
  assignNestedTargetContainerObject () {
    return `target${depth} = target${depth - 1}[‘${key}’]`
  }

  /**
   * assignNestedSourceObject
   */
  assignNestedSourceObject () {
    return `source${depth} = source${depth - 1}[‘${key}’]`
  }

  /**
   * initializeCounter
   */
  initializeCounter () {
    return `count${depth} = 0`
  }

  /**
   * assignSourceValueToTarget
   */
  assignSourceValueToTarget () {
    return `target${ depth }[‘${ key }’] = source${ depth }[‘${ key }’]`
  }

  /**
   * incrementCounter
   */
  incrementCounter () {
    return `count${depth}++`
  }

  /**
   * optionalDefaults
   */
  optionalDefaults () {
    let block = ``

    block += this.assignDefaultValueToTarget()
    block += this.incrementCounter()

    return `
      else if (options.defaults !== false) {
        ${block}
      }
    `
  }

  /**
   * assignDefaultValueToTarget
   */
  assignDefaultValueToTarget () {
    return `target${ depth }[‘${ key }’] = ${ JSON.stringify(value) }`
  }

  /**
   * attachNestedTargetContainer
   */
  attachNestedTargetContainer () {
    return `
      if (count${ depth } > 0) {
        ${ this.attachTargetContainer() }
      }
    `
  }

  /**
   * attachTargetContainer
   */
  attachTargetContainer () {
    return `target${ depth - 1 }[‘${ key }’] = target${ depth }`
  }

}
