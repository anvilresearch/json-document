'use strict'

const benchmark = require('benchmark')
const suite = new benchmark.Suite()

const Modinha = require('modinha')
const Initializer = require('../src/Initializer')

let schema = {
  properties: {
    a: { type: 'string' },
    b: { type: 'string', default: 'bbbb' },
    c: { type: 'string', default: 'c' },
    d: {
      properties: {
        e: { type: 'string' },
        f: { type: 'string', default: 'fff' },
        g: {
          properties: {
            h: { type: 'string' }
          }
        }
      }
    }
  }
}

let Model = Modinha.define(schema)
let initializer = new Initializer(schema)
initializer.parse()
let fn = initializer.compile()

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
  .add('iteration', function () {
    let obj = Model.initialize(source)
  })
  .add('generated', function () {
    let obj = fn({}, source)
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
