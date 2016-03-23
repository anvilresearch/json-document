'use strict'

const benchmark = require('benchmark')
const suite = new benchmark.Suite()
const Initializer = require('../src/Initializer')

let schema = {
  properties: {
    a: { type: 'string' },
    b: { type: 'string', default: 'bbbb' },
    c: { type: 'string', default: 'c', private: true },
    d: {
      properties: {
        e: { type: 'string' },
        f: { type: 'string', default: function () { return 'fff' } },
        g: {
          properties: {
            h: { type: 'string' }
          }
        }
      }
    }
  }
}

class InitializerTrue extends Initializer {

  private (operation) {
    return `
    if (options.private === true) {
      ${this.assign(operation)}
    }
    `
  }

}

class InitializerTruthy extends Initializer {

  private (operation) {
    return `
    if (options.private) {
      ${this.assign(operation)}
    }
    `
  }

}

let initializer_true = new InitializerTrue(schema)
let initializer_truthy = new InitializerTruthy(schema)
initializer_true.parse()
initializer_truthy.parse()
let fn_true = initializer_true.compile()
let fn_truthy = initializer_truthy.compile()

let source = {
  b: 'b',
  d: {
    e: 'EEE',
    g: {
      h: 'H'
    }
  }
}

suite
  .add('true', function () {
    let obj = fn_true({}, source)
  })
  .add('truthy', function () {
    let obj = fn_truthy({}, source)
  })
  .on('cycle', function (event) {
    console.log(String(event.target))
  })
  .on('complete', function () {
    console.log(`Fastest is ${this.filter('fastest').map('name')}`)
  })
  .run({
    async: true
  })
