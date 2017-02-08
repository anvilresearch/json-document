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
 *  start := { declaration } container
 *
 *  container :=
 *    member { member }
 *
 *  declaration :=
 *    sourceDeclaration targetDeclaration countDeclaration
 *
 *  member :=
 *    [ optionalDefault ] ( sourceHasOwnProperty | sourceHasArrayItem ) [ attachNestedTargetContainer ]
 *
 *  sourceHasOwnProperty :=
 *    sourceValueIsObject sourceValueIsNotExpectedType
 *    | assignTargetValueFromSource incrementCounter
 *
 *  sourceHasArrayItem :=
 *    sourceValueIsArray sourceValueIsNotExpectedType
 *    | assignTargetValueFromSource incrementCounter
 *
 *  sourceValueIsArray :=
 *    ( ensureNestedTargetContainerArrayFromObject | ensureNestedTargetContainerArrayFromArray )
 *    assignNestedSource initializeCounter container
 *
 *  sourceValueIsObject :=
 *    ( ensureNestedTargetContainerObjectFromArray | ensureNestedTargetContainerObjectFromObject )
 *    assignNestedSource initializeCounter container
 *
 *  optionalDefault :=
 *    assignDefaultValueToTarget incrementCounter
 *
 *  attachNestedTargetContainer :=
 *    attachTargetContainer incrementCounter
 *
 *  sourceValueIsNotExpectedType
 *  ensureNestedTargetContainerArrayFromObject
 *  ensureNestedTargetContainerArrayFromArray
 *  ensureNestedTargetContainerObjectFromObject
 *  ensureNestedTargetContainerObjectFromArray
 *  assignNestedSource
 *  initializeCounter
 *  assignTargetValueFromSourceArray
 *  assignTargetValueFromSource
 *  incrementCounter
 *  assignDefaultValueToTarget
 *  attachTargetContainer
 */




class Initializer2 {

  /**
   * compile
   */
  static compile (schema) {}
  compile () {}

  /**
   * Composite elements
   */

  /**
   * start
   */
  start () {}

  /**
   * container
   */
  container () {}

  /**
   * declaration
   */
  declaration () {}

  /**
   * member
   */
  member () {}

  /**
   * sourceHasOwnProperty
   */
  sourceHasOwnProperty () {}

  /**
   * sourceHasArrayItem
   */
  sourceHasArrayItem () {}

  /**
   * sourceValueIsArray
   */
  sourceValueIsArray () {}

  /**
   * sourceValueIsObject
   */
  sourceValueIsObject () {}

  /**
   * optionalDefault
   */
  optionalDefault () {}

  /**
   * attachNestedTargetContainer
   */
  attachNestedTargetContainer () {}

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

    return `target${ level }["${ key }"] = ${ value }`
  }

  /**
   * assignNestedSource
   *
   * @returns {String}
   */
  assignNestedSource () {
    let { level, key } = this

    return `source${ level } = source${ level - 1 }["${ key }"]`
  }

  /**
   * assignTargetValueFromSource
   *
   * @returns {String}
   */
  assignTargetValueFromSource () {
    let { level, key } = this

    return `target${ level }["${ key }"] = source${ level }["${ key }"]`
  }

  /**
   * attachTargetContainer
   *
   * @returns {String}
   */
  attachTargetContainer () {
    let { level, key } = this

    return `
      if (count${ level } > 0) {
        target${ level - 1 }[${ key }] = target${ level }
        count${ level - 1 }++
      }
    `
  }

  /**
   * ensureNestedTargetContainerArrayFromObject
   *
   * @returns {String}
   */
  ensureNestedTargetContainerArrayFromObject () {
    let { level, key } = this

    return `
      if (!target${ level - 1 }.hasOwnProperty("${ key }") || !Array.isArray(target${ level - 1 }[${ key }]) {
        target${ level } = []
      } else {
        target${ level } = target${ level - 1 }[${ key }]
      }
    `
  }

  /**
   * ensureNestedTargetContainerObjectFromArray
   *
   * @returns {String}
   */
  ensureNestedTargetContainerObjectFromArray () {
    let { level, key } = this

    return `
      if (${ key } >= target${ level - 1 }.length || typeof target${ level - 1 }["${ key }"] !== 'object') {
        target${ level } = {}
      } else {
        target${ level } = target${ level - 1 }["${ key }"]
      }
    `
  }

  /**
   * ensureNestedTargetContainerArrayFromArray
   *
   * @returns {String}
   */
  ensureNestedTargetContainerArrayFromArray () {
    let { level, key } = this

    return `
      if (${ key } >= target${ level - 1 }.length || !Array.isArray(target${ level - 1 }[${ key }]) {
        target${ level } = []
      } else {
        target${ level } = target${ level - 1 }[${ key }]
      }
    `
  }

  /**
   * ensureNestedTargetContainerObjectFromObject
   *
   * @returns {String}
   */
  ensureNestedTargetContainerObjectFromObject () {
    let { level, key } = this

    return `
      if (!target${ level - 1 }.hasOwnProperty("${ key }") || typeof target${ level - 1 }["${ key }"] !== 'object') {
        target${ level } = {}
      } else {
        target${ level } = target${ level - 1 }["${ key }"]
      }
    `
  }

  /**
   * incrementCounter
   */
  incrementCounter () {}

  /**
   * initializeCounter
   */
  initializeCounter () {}

  /**
   * sourceValueIsNotExpectedType
   */
  sourceValueIsNotExpectedType () {}





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
