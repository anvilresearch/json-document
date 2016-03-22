'use strict'

/**
 * Test dependencies
 */
const cwd = process.cwd()
const path = require('path')
const chai = require('chai')
const sinon = require('sinon')
const sinonChai = require('sinon-chai')

/**
 * Assertions
 */
chai.use(sinonChai)
chai.should()
let expect = chai.expect

/**
 * Code under test
 */
const Initializer = require('../src/Initializer')

/**
 *
 */
describe('Initializer', () => {

  let schema = {
    properties: {
      a: {
        type: 'string'
      },
      b: {
        type: 'string'
      },
      c: {
        type: 'string',
        private: true
      },
      exists: {
        type: 'string'
      },
      immutable: {
        type: 'string',
        immutable: true
      },
      setter: {
        type: 'string',
        set: (data) => {
          return this.setter = `${data.setter}ter`
        }
      },
      d: {
        type: 'string',
        default: 'default'
      },
      e: {
        type: 'string',
        default: () => 'defaultfn'
      },
      after: {
        type: 'string',
        after: data => `${data.after} assignment`
      }
    }
  }

  describe.only('generated function', () => {
    let initializer, source, target, fn

    beforeEach(() => {
      initializer = new Initializer(schema)
      initializer.parse()
      fn = initializer.compile()

      target = {}
      source = {
        a: 'a',
        b: '',
        c: 'private',
        immutable: 'immutable',
        setter: 'set',
        after: 'after'
      }
    })

    it('should set a property on target from source', () => {
      fn(target, source)
      target.a.should.equal('a')
    })

    it('should set an empty string on a target from source', () => {
      fn(target, source)
      target.b.should.equal('')
    })

    it('should skip private properties by default', () => {
      fn(target, source)
      expect(target.c).to.be.undefined
    })

    it('should optionally assign private properties', () => {
      fn(target, source, { private: true })
      target.c.should.equal('private')
    })

    it('should define immutable properties')
    it('should set a property from a setter method')
    it('should set a property from a default value', () => {
      fn(target, source)
      target.d.should.equal('default')
    })

    it('should set a property from a default function', () => {
      fn(target, source)
      target.e.should.equal('defaultfn')
    })
    it('should optionally skip default assignment')
    it('should invoke an "after" method')
  })

  describe('parse', () => {

    it('should do stuff', () => {
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

      let i = new Initializer(schema)
      i.parse()
      //console.log(i)
      let fn = i.compile()
      let target = {}
      console.log(fn.toString())
      fn(target, {
        b: 'b',
        d: {
          e: 'EEE',
          g: {
            h: 'H'
          }
        }
      })
      console.log(target)
    })

  })

})
