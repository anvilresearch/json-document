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
      d: {
        type: 'string',
        default: 'default'
      },
      e: {
        type: 'string',
        default: () => 'defaultfn'
      },
      f: {
        type: 'string',
        immutable: true
      },
      g: {
        properties: {
          h: {
            type: 'string',
            immutable: true,
            default: 'h'
          }
        }
      },
      i: {
        properties: {
          j: {
            properties: {
              k: {
                type: 'string'
              }
            }
          }
        }
      },
      l: {
        type: 'string',
        set: function (data) {
          return `${data.l} bar`
        }
      },
      m: {
        type: 'string',
        after: function (data) {
          this.after = `${data.m} assignment`
        }
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
        f: 'immutable',
        g: {
          h: 'hello world'
        },
        i: { j: { k: 'k' } },
        l: 'foo',
        m: 'after'
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

    it('should define immutable properties', () => {
      fn(target, source, {})
      expect(
        function () { target.f = 'f' }
      ).to.throw(Error)
    })

    it('should set a property from a default value', () => {
      fn(target, source)
      target.d.should.equal('default')
    })

    it('should set a property from a default function', () => {
      fn(target, source)
      target.e.should.equal('defaultfn')
    })

    it('should optionally skip default assignment', () => {
      fn(target, source, { defaults: false })
      expect(target.d).to.equal(undefined)
    })

    it('should set a default immutable property', () => {
      fn(target, source)
      expect(
        function () { target.g.h = 'hello world' }
      ).to.throw(Error)
    })

    it('should set a nested property on target from source', () => {
      fn(target, source)
      target.i.j.k.should.equal('k')
    })

    it('should set a property from a setter method', () => {
      fn(target, source)
      target.l.should.equal('foo bar')
    })

    it('should invoke an "after" method', () => {
      fn(target, source)
      target.after.should.equal('after assignment')
    })
  })

  describe('parse', () => {

    it('should identify operations')
    it('should set operation key')
    it('should set operation fn')
    it('should set operation ref for root object members')
    it('should set operation ref for nested object members')
    it('should set operation chain for root object members')
    it('should set operation chain for nested object members')
    it('should flag private property operations')
    it('should flag default value operations')
    it('should flag immutable properties')
    it('should flag setter operations')
    it('should group operations by container')


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
