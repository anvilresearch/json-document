'use strict'

/**
 * Test dependencies
 */
const cwd = process.cwd()
const path = require('path')
const chai = require('chai')

/**
 * Assertions
 */
chai.should()
let expect = chai.expect

/**
 * Code under test
 */
const Initializer = require('../src/Initializer2a')


/**
 * Tests
 */
describe.only('Initializer2a', () => {
  let schema, fn

  /**
   * Object root schema
   */
  describe('object root schema', () => {
    let schema, fn

    beforeEach(() => {
      schema = {
        properties: {
          a: { type: 'string' },
          b: { type: 'number' },
          c: { type: 'integer' },
          d: { type: 'boolean' },
          e: { type: 'null' },
          f: { type: 'undefined' },
          g: { type: 'object' },
          h: { type: 'array' }
        }
      }

      fn = Initializer.compile(schema)
    })

    it('should assign primitive values of expected type on source to target', () => {
      let target = {}
      let source = {
        a: 'value',
        b: 123.45,
        c: 678,
        d: true,
        e: null,
        f: undefined
      }

      fn(target, source)

      expect(target.a).to.equal('value')
      expect(target.b).to.equal(123.45)
      expect(target.c).to.equal(678)
      expect(target.d).to.equal(true)
      expect(target.e).to.equal(null)
      expect(target.f).to.equal(undefined)
      expect(target.hasOwnProperty('f')).to.be.true
    })

    it('should assign falsy values present on source to target', () => {
      let target = {}
      let source = {
        a: '',
        b: 0.00,
        c: 0,
        d: false,
        e: null,
        f: undefined
      }

      fn(target, source)

      expect(target.a).to.equal('')
      expect(target.b).to.equal(0)
      expect(target.c).to.equal(0)
      expect(target.d).to.equal(false)
      expect(target.e).to.equal(null)
      expect(target.f).to.equal(undefined)
      expect(target.hasOwnProperty('f')).to.be.true
    })

    it('should assign composite values of expected type on source to target', () => {
      let g = {}, h = []
      let target = {}
      let source = { g , h }

      fn(target, source)

      expect(target.g).to.equal(g)
      expect(target.h).to.equal(h)
    })

    it('should assign values of unexpected type on source to target', () => {
      let target = {}
      let source = {
        a: false,
        b: {},
        c: [],
        d: 1337,
        e: {},
        f: 'foo',
        g: 3.14,
        h: 'hello'
      }

      fn(target, source)

      expect(target.a).to.equal(false)
      expect(target.b).to.eql({})
      expect(target.c).to.eql([])
      expect(target.d).to.equal(1337)
      expect(target.e).to.eql({})
      expect(target.f).to.equal('foo')
      expect(target.g).to.equal(3.14)
      expect(target.h).to.equal('hello')
    })

    it('should not assign schema-defined values not present on source to target', () => {
      let target = {}
      let source = {
        a: false,
        c: [],
        e: {},
        g: 3.14,
      }

      fn(target, source)

      expect(target.a).to.equal(false)
      expect(target.hasOwnProperty('b')).to.be.false
      expect(target.c).to.eql([])
      expect(target.hasOwnProperty('d')).to.be.false
      expect(target.e).to.eql({})
      expect(target.hasOwnProperty('f')).to.be.false
      expect(target.g).to.equal(3.14)
      expect(target.hasOwnProperty('h')).to.be.false
    })

    it('should assign default values of expected type to target', () => {
      schema.properties.a.default = 'value'
      schema.properties.b.default = 51.50
      schema.properties.c.default = 6849
      schema.properties.d.default = false
      schema.properties.e.default = null
      schema.properties.f.default = undefined

      let g = { foo: 'bar' }
      schema.properties.g.default = g

      let h = { baz: 'quux' }
      schema.properties.h.default = h

      let target = {}
      let source = {}

      Initializer.compile(schema)(target, source)

      expect(target.a).to.equal('value')
      expect(target.b).to.equal(51.50)
      expect(target.c).to.equal(6849)
      expect(target.d).to.equal(false)
      expect(target.e).to.equal(null)
      expect(target.f).to.equal(undefined)
      expect(target.hasOwnProperty('f')).to.be.true
      expect(target.g).to.eql(g)
      expect(target.h).to.eql(h)
    })

    it('should assign default values of conflicting type to target', () => {
      schema.properties.a.default = true
      schema.properties.b.default = null
      schema.properties.c.default = false
      schema.properties.d.default = 'wat'
      schema.properties.e.default = 666
      schema.properties.f.default = {}
      schema.properties.g.default = ''
      schema.properties.h.default = undefined

      let target = {}
      let source = {}

      Initializer.compile(schema)(target, source)

      expect(target.a).to.equal(true)
      expect(target.b).to.equal(null)
      expect(target.c).to.equal(false)
      expect(target.d).to.equal('wat')
      expect(target.e).to.equal(666)
      expect(target.f).to.eql({})
      expect(target.g).to.eql('')
      expect(target.h).to.eql(undefined)
      expect(target.hasOwnProperty('h')).to.be.true
    })

    it('should overwrite default values with values present on source', () => {
      schema.properties.a.default = 'value'
      schema.properties.b.default = 51.50
      schema.properties.c.default = 6849
      schema.properties.d.default = false
      schema.properties.e.default = null
      schema.properties.f.default = undefined

      let g = { foo: 'bar' }
      schema.properties.g.default = g

      let h = { baz: 'quux' }
      schema.properties.h.default = h

      let target = {}
      let source = {
        a: 'not default',
        b: 'not default',
        c: 'not default',
        d: 'not default',
        e: 'not default',
        f: 'not default',
        g: 'not default',
        h: 'not default'
      }

      Initializer.compile(schema)(target, source)

      expect(target.a).to.equal('not default')
      expect(target.b).to.equal('not default')
      expect(target.c).to.equal('not default')
      expect(target.d).to.equal('not default')
      expect(target.e).to.equal('not default')
      expect(target.f).to.equal('not default')
      expect(target.g).to.equal('not default')
      expect(target.h).to.equal('not default')
    })

    it('should optionally skip initializing default values', () => {
      schema.properties.a.default = 'value'
      schema.properties.b.default = 'value'
      schema.properties.c.default = 'value'
      schema.properties.d.default = 'value'
      schema.properties.e.default = 'value'
      schema.properties.f.default = 'value'
      schema.properties.g.default = 'value'
      schema.properties.h.default = 'value'

      let target = {}
      let source = {}

      Initializer.compile(schema)(target, source, { defaults: false })

      expect(target.hasOwnProperty('a')).to.be.false
      expect(target.hasOwnProperty('b')).to.be.false
      expect(target.hasOwnProperty('c')).to.be.false
      expect(target.hasOwnProperty('d')).to.be.false
      expect(target.hasOwnProperty('e')).to.be.false
      expect(target.hasOwnProperty('f')).to.be.false
      expect(target.hasOwnProperty('g')).to.be.false
      expect(target.hasOwnProperty('h')).to.be.false
    })

    it('should not assign non-schema-defined values present on source to target', () => {
      let target = {}
      let source = {
        a: 'value',
        i: 2,
        j: true,
        k: null,
        l: undefined,
        m: {},
        n: []
      }

      fn(target, source)

      expect(target.a).to.equal('value')
      expect(target.hasOwnProperty('b')).to.be.false
      expect(target.hasOwnProperty('c')).to.be.false
      expect(target.hasOwnProperty('d')).to.be.false
      expect(target.hasOwnProperty('e')).to.be.false
      expect(target.hasOwnProperty('f')).to.be.false
      expect(target.hasOwnProperty('g')).to.be.false
      expect(target.hasOwnProperty('h')).to.be.false
      expect(target.hasOwnProperty('i')).to.be.false
      expect(target.hasOwnProperty('j')).to.be.false
      expect(target.hasOwnProperty('k')).to.be.false
      expect(target.hasOwnProperty('l')).to.be.false
      expect(target.hasOwnProperty('m')).to.be.false
      expect(target.hasOwnProperty('n')).to.be.false
    })

    it('should optionally assign non-schema-defined values present on source to target')
    it('should leave values present on the target and not present on source intact', () => {
      let g = {}, h = []
      let target = {
        a: 'value',
        b: 123.45,
        c: 678,
        d: true,
        e: null,
        f: undefined,
        g,
        h
      }
      let source = {}

      fn(target, source)

      expect(target.a).to.equal('value')
      expect(target.b).to.equal(123.45)
      expect(target.c).to.equal(678)
      expect(target.d).to.equal(true)
      expect(target.e).to.equal(null)
      expect(target.f).to.equal(undefined)
      expect(target.hasOwnProperty('f')).to.be.true
      expect(target.g).to.equal(g)
      expect(target.h).to.equal(h)
    })

    it('should overwrite values present on target with values present on source', () => {
      let g = {}, h = []

      let target = {
        a: 'value',
        b: 123.45,
        c: 678,
        d: true,
        e: null,
        f: undefined,
        g,
        h
      }

      let source = {
        b: 'changed',
        d: 'changed',
        f: 'changed',
        h: 'changed'
      }

      fn(target, source)

      expect(target.a).to.equal('value')
      expect(target.b).to.equal('changed')
      expect(target.c).to.equal(678)
      expect(target.d).to.equal('changed')
      expect(target.e).to.equal(null)
      expect(target.f).to.equal('changed')
      expect(target.g).to.equal(g)
      expect(target.h).to.equal('changed')
    })

    it('should coerce values to schema-defined type if possible')
    it('should assign uncoerceable values')
  })

  /**
   * Array root schema
   */
  describe('array root schema', () => {
    it('should assign primitive values of expected type on source to target', () => {
      let schema = {
        items: {
          type: 'integer'
        }
      }

      let fn = Initializer.compile(schema)

      let target = []
      let source = [1,2,3,4,5]

      fn(target, source)

      target[0].should.equal(1)
      target[1].should.equal(2)
      target[2].should.equal(3)
      target[3].should.equal(4)
      target[4].should.equal(5)
      target.length.should.equal(5)
    })

    it('should assign falsy values present on source to target', () => {
      let schema = {
        items: {
          type: 'integer'
        }
      }

      let fn = Initializer.compile(schema)

      let target = []
      let source = [null, '', false, 0, undefined]

      fn(target, source)

      expect(target[0]).to.equal(null)
      expect(target[1]).to.equal('')
      expect(target[2]).to.equal(false)
      expect(target[3]).to.equal(0)
      expect(target[4]).to.equal(undefined)
      target.length.should.equal(5)
    })

    it('should assign composite values on source to target', () => {
      let schema = {
        items: {
          type: ['object', 'array']
        }
      }

      let fn = Initializer.compile(schema)

      let target = []
      let source = [
        { a: 1 },
        [ 2 ],
        { c: 3 },
        [ 4, 5 ],
        { e: 6 }
      ]

      fn(target, source)

      target[0].should.eql({ a: 1 })
      target[1].should.eql([ 2 ])
      target[2].should.eql({ c: 3 })
      target[3].should.eql([ 4, 5 ])
      target[4].should.eql({ e: 6 })
      target.length.should.equal(5)
    })

    it('should assign values of unexpected type on source to target', () => {
      let schema = {
        items: {
          type: 'integer'
        }
      }

      let fn = Initializer.compile(schema)

      let target = []
      let source = [ {}, [], false, '??', 3.1459 ]

      fn(target, source)

      expect(target[0]).to.eql({})
      expect(target[1]).to.eql([])
      expect(target[2]).to.equal(false)
      expect(target[3]).to.equal('??')
      expect(target[4]).to.equal(3.14590)
      target.length.should.equal(5)
    })
  })

  /**
   * array root schemas (plural)
   */
  describe('array root schemas (plural)', () => {})

  /**
   * Object root nested object schema
   */
  describe('object root nested object schema', () => {
    let schema, fn

    beforeEach(() => {
      schema = {
        properties: {
          a: {
            properties: {
              b: { type: 'string' }
            }
          },
          c: {
            properties: {
              d: { type: 'string' }
            }
          },
          e: { type: 'string' }
        }
      }

      fn = Initializer.compile(schema)
    })

    it('should create nested object when missing from target', () => {
      let target = {}
      let source = { a: { b: 'value' }, e: 'other' }

      fn(target, source)

      target.a.should.be.an('object')
      target.a.b.should.equal('value')
      target.should.not.have.property('c')
      target.e.should.equal('other')
    })

    it('should modify nested object when present on target', () => {
      let target = { a: { b: 'value'} }
      let source = { a: { b: 'changed' }, e: 'other' }

      fn(target, source)

      target.a.should.be.an('object')
      target.a.b.should.equal('changed')
      target.should.not.have.property('c')
      target.e.should.equal('other')
    })

    it('should replace unexpected non-object value with nested object', () => {
      let target = { a: [] }
      let source = { a: { b: 'changed' }, e: 'other' }

      fn(target, source)

      target.a.should.be.an('object')
      target.a.b.should.equal('changed')
      target.should.not.have.property('c')
      target.e.should.equal('other')
    })

    it('should assign non-object values to target from source', () => {
      let target = {}
      let source = { a: false }

      fn(target, source)
      target.should.eql(source)
    })

    it('should not create empty object on target for values not present on source', () => {
      let target = {}
      let source = { c: { d: 'value' } }

      fn(target, source)

      target.should.not.have.property('a')
    })

    it('should assign empty object on target when present on source', () => {
      let target = {}
      let source = { a: {} }

      fn(target, source)

      target.should.have.property('a')
      target.a.should.be.an('object')
      target.a.should.eql({})
    })

    it('should assign first-level default values', () => {
      schema = {
        properties: {
          a: {
            type: 'number',
            default: 1
          },
          b: {
            properties: {
              c: { type: 'number' }
            },
            default: { c: 3 }
          },
          d: {
            default: [ 1, 2, 3 ]
          },
          f: {
            type: 'number',
            default: 6
          }
        }
      }

      let target = {}
      let source = {}

      Initializer.compile(schema)(target, source)

      expect(target.a).to.equal(1)
      expect(target.b).to.eql({ c: 3 })
      expect(target.d).to.eql([ 1, 2, 3 ])
      expect(target.f).to.equal(6)
    })

    it('should assign nested object default values', () => {
      schema = {
        properties: {
          a: {
            type: 'number'
          },
          b: {
            properties: {
              c: { type: 'number', default: 3 }
            }
          }
        }
      }

      let target = {}
      let source = {}

      Initializer.compile(schema)(target, source)

      target.should.not.have.property('a')
      target.b.c.should.equal(3)
    })

    it('should handle ambiguous nested defaults (somehow')
    it('should optionally skip initializing default values')
    it('should not assign non-schema-defined values present on source to target')
    it('should optionally assign non-schema-defined values present on source to target')
    it('should leave values present on the target and not present on source intact')
    it('should overwrite values present on target with values present on source')
    it('should coerce values to schema-defined type if possible')
    it('should assign uncoerceable values')
  })

  // object -> object -> primitive
  // object -> object -> object -> primitive
  // object -> array -> primitive
  // object -> array -> object -> primitive
  // object -> array -> array -> primitive
  // array -> object -> object -> primitive
  // array -> array -> object -> primitive
  // array -> array -> array -> primitive
  // array -> array -> primitive


  /**
   * Object root first-level primitive default values
   */
  describe('object root first-level primitive default values', () => {
    it('should be assigned when source values are not present', () => {
      let schema = {
        properties: {
          a: { default: true },
          b: { default: 1.23 },
          c: { default: 45 },
          d: { default: 'value' }
        }
      }

      let fn = Initializer.compile(schema)

      let target = {}
      let source = {}

      fn(target, source)

      target.a.should.equal(true)
      target.b.should.equal(1.23)
      target.c.should.equal(45)
      target.d.should.equal('value')
    })

    it('should be assigned when default values are falsy', () => {
      let schema = {
        properties: {
          a: { default: undefined },
          b: { default: null },
          c: { default: false },
          d: { default: '' },
          e: { default: 0 }
        }
      }

      let fn = Initializer.compile(schema)

      let target = {}
      let source = {}

      fn(target, source)

      target.should.have.property('a')
      target.should.have.property('b')
      target.should.have.property('c')
      target.should.have.property('d')
      target.should.have.property('e')

      expect(target.a).to.equal(undefined)
      expect(target.b).to.equal(null)
      expect(target.c).to.equal(false)
      expect(target.d).to.equal('')
      expect(target.e).to.equal(0)
    })

    it('should be assigned when default types do not match property types', () => {
      let schema = {
        properties: {
          a: { type: 'array', default: true },
          b: { type: 'boolean', default: 3 },
          c: { type: 'integer', default: null },
          d: { type: 'null', default: 3.1459 },
          e: { type: 'object', default: 'other' },
        }
      }

      let fn = Initializer.compile(schema)

      let target = {}
      let source = {}

      fn(target, source)

      target.a.should.equal(true)
      target.b.should.equal(3)
      expect(target.c).to.equal(null)
      target.d.should.equal(3.1459)
      target.e.should.equal('other')
    })

    it('should be overridden when source values are present', () => {
      let schema = {
        properties: {
          a: { default: true },
          b: { default: 1.23 },
          c: { default: 45 },
          d: { default: 'value' },
          e: { default: undefined },
          f: { default: null },
          g: { default: false },
          h: { default: '' },
          i: { default: 0 }
        }
      }

      let fn = Initializer.compile(schema)

      let target = {}
      let source = {
        a: false,
        b: 2.34,
        c: 56,
        d: 'not default',
        e: 'defined',
        f: 'not null',
        g: true,
        h: 'not empty',
        i: 1
      }

      fn(target, source)

      target.a.should.equal(false)
      target.b.should.equal(2.34)
      target.c.should.equal(56)
      target.d.should.equal('not default')
      target.e.should.equal('defined')
      target.f.should.equal('not null')
      target.g.should.equal(true)
      target.h.should.equal('not empty')
      target.i.should.equal(1)
    })

    it('should be overridden when source value types do not match', () => {
      let schema = {
        properties: {
          a: { type: 'boolean', default: true },
          b: { type: 'integer', default: 3 },
          c: { type: 'null', default: null },
          d: { type: 'number', default: 1.23 },
          e: { type: 'string', default: 'value' },
          f: { type: 'undefined', default: undefined }
        }
      }

      let fn = Initializer.compile(schema)

      let target = {}
      let source = {
        a: 7,
        b: null,
        c: 3.33,
        d: 'value',
        e: undefined,
        f: true
      }

      fn(target, source)

      target.a.should.equal(7)
      expect(target.b).to.equal(null)
      target.c.should.equal(3.33)
      target.d.should.equal('value')
      expect(target.e).to.equal(undefined)
      target.f.should.equal(true)
    })

    it('should optionally not be assigned', () => {
      let schema = {
        properties: {
          a: { default: true },
          b: { default: 1.23 },
          c: { default: 45 },
          d: { default: 'value' },
          e: { default: null },
          f: { default: undefined }
        }
      }

      let fn = Initializer.compile(schema)

      let target = {}
      let source = { c: 64 }

      fn(target, source, { defaults: false })
      target.should.eql({ c: 64 })
    })
  })

  /**
   * Object root first-level object default values
   */
  describe('object root first-level object default values', () => {
    it('should be assigned when source values are not present', () => {
      let schema = {
        properties: {
          a: { default: {} },
          b: { default: { foo: 'bar' } },
          c: { default: { list: [1, 2, 3 ] } },
          d: { default: { foo: { bar: 'baz' } } }
        }
      }

      let fn = Initializer.compile(schema)

      let target = {}
      let source = {}

      fn(target, source)

      target.a.should.eql(schema.properties.a.default)
      target.b.should.eql(schema.properties.b.default)
      target.c.should.eql(schema.properties.c.default)
      target.d.should.eql(schema.properties.d.default)
    })

    it('should be assigned when default types do not match property types', () => {
      let schema = {
        properties: {
          a: { type: 'array', default: {} },
          b: { type: 'boolean', default: { foo: 'bar' } },
          c: { type: 'integer', default: { list: [1, 2, 3 ] } },
          d: { type: 'null', default: { bar: 'baz' } },
          e: { type: 'number', default: { baz: 'quux' } },
          f: { type: 'string', default: { quux: 'foo' } }
        }
      }

      let fn = Initializer.compile(schema)

      let target = {}
      let source = {}

      fn(target, source)

      target.a.should.eql(schema.properties.a.default)
      target.b.should.eql(schema.properties.b.default)
      target.c.should.eql(schema.properties.c.default)
      target.d.should.eql(schema.properties.d.default)
      target.e.should.eql(schema.properties.e.default)
      target.f.should.eql(schema.properties.f.default)
    })

    it('should be overridden when source values are present', () => {
      let schema = {
        properties: {
          a: { default: {} },
          b: { default: { foo: 'bar' } },
          c: { default: { list: [1, 2, 3 ] } },
          d: { default: { foo: { bar: 'baz' } } }
        }
      }

      let fn = Initializer.compile(schema)

      let target = {}
      let source = {
        a: { w: 1 },
        b: { x: 2 },
        c: { y: 3 },
        d: { z: 4 }
      }

      fn(target, source)

      target.a.should.eql(source.a)
      target.b.should.eql(source.b)
      target.c.should.eql(source.c)
      target.d.should.eql(source.d)
    })

    it('should be overridden when source value types do not match', () => {
      let schema = {
        properties: {
          a: { type: 'array', default: {} },
          b: { type: 'boolean', default: { foo: 'bar' } },
          c: { type: 'integer', default: { list: [1, 2, 3 ] } },
          d: { type: 'null', default: { bar: 'baz' } },
          e: { type: 'number', default: { baz: 'quux' } },
          f: { type: 'string', default: { quux: 'foo' } },
          g: { type: 'undefined', default: { blah: 'blah' } }
        }
      }

      let fn = Initializer.compile(schema)

      let target = {}
      let source = {
        a: { foo: 'bar' },
        b: {},
        c: {},
        d: {},
        e: {},
        f: {},
        g: {},
      }

      fn(target, source)

      target.a.should.eql(source.a)
      target.b.should.eql({})
      target.c.should.eql({})
      target.d.should.eql({})
      target.e.should.eql({})
      target.f.should.eql({})
      target.g.should.eql({})
    })

    it('should optionally not be assigned', () => {
      let schema = {
        properties: {
          a: { default: {} },
          b: { default: { foo: 'bar' } },
          c: { default: { list: [1, 2, 3 ] } },
          d: { default: { foo: { bar: 'baz' } } }
        }
      }

      let fn = Initializer.compile(schema)

      let target = {}
      let source = {}

      fn(target, source, { defaults: false })

      target.should.not.have.property('a')
      target.should.not.have.property('b')
      target.should.not.have.property('c')
      target.should.not.have.property('d')
    })
  })

  /**
   * Object root first-level array default values
   */
  describe('object root first-level array default values', () => {
    it('should be assigned when source values are not present', () => {
      let schema = {
        properties: {
          a: { default: [ 1, 2, 3 ] },
          b: { default: [ 2, 3, 4 ] },
          c: { default: [ 3, 4, 5 ] },
          d: { default: [ 4, 5, 6 ] }
        }
      }

      let fn = Initializer.compile(schema)

      let target = {}
      let source = {}

      fn(target, source)

      target.a.should.eql(schema.properties.a.default)
      target.b.should.eql(schema.properties.b.default)
      target.c.should.eql(schema.properties.c.default)
      target.d.should.eql(schema.properties.d.default)
    })

    it('should be assigned when default types do not match property types', () => {
      let schema = {
        properties: {
          a: { type: 'array', default: [ 1, 2, 3 ] },
          b: { type: 'boolean', default: [ 2, 3, 4 ] },
          c: { type: 'integer', default: [ 3, 4 ,5 ] },
          d: { type: 'null', default: [ 4, 5, 6 ] },
          e: { type: 'number', default: [ 5, 6, 7 ] },
          f: { type: 'string', default: [ 6, 7, 8 ] },
          g: { type: 'undefined', default: [ 7, 8, 9 ] }
        }
      }

      let fn = Initializer.compile(schema)

      let target = {}
      let source = {}

      fn(target, source)

      target.a.should.eql(schema.properties.a.default)
      target.b.should.eql(schema.properties.b.default)
      target.c.should.eql(schema.properties.c.default)
      target.d.should.eql(schema.properties.d.default)
      target.e.should.eql(schema.properties.e.default)
      target.f.should.eql(schema.properties.f.default)
      target.g.should.eql(schema.properties.g.default)
    })

    it('should be overridden when source values are present', () => {
      let schema = {
        properties: {
          a: { default: [ 1, 2, 3 ] },
          b: { default: [ 2, 3, 4 ] },
          c: { default: [ 3, 4, 5 ] },
          d: { default: [ 4, 5, 6 ] }
        }
      }

      let fn = Initializer.compile(schema)

      let target = {}
      let source = {
        a: [ 5, 6, 7 ],
        b: [ 6, 7, 8 ],
        c: [ 7, 8, 9 ],
        d: [ 8, 9, 0 ]
      }

      fn(target, source)

      target.a.should.eql(source.a)
      target.b.should.eql(source.b)
      target.c.should.eql(source.c)
      target.d.should.eql(source.d)
    })

    it('should be overridden when source value types do not match', () => {
      let schema = {
        properties: {
          a: { type: 'array', default: [] },
          b: { type: 'boolean', default: false },
          c: { type: 'integer', default: 23 },
          d: { type: 'null', default: null },
          e: { type: 'number', default: 2.33 },
          f: { type: 'string', default: 'value' },
          g: { type: 'object', default: {} },
          h: { type: 'undefined', default: undefined },
        }
      }

      let fn = Initializer.compile(schema)

      let target = {}
      let source = {
        a: [ 1, 2, 3 ],
        b: [ 2, 3, 4 ],
        c: [ 3, 4, 5 ],
        d: [ 4, 5, 6 ],
        e: [ 5, 6, 7 ],
        f: [ 6, 7, 8 ],
        g: [ 7, 8, 9 ],
        h: [ 8, 9, 0 ],
      }

      fn(target, source)

      target.a.should.eql(source.a)
      target.b.should.eql(source.b)
      target.c.should.eql(source.c)
      target.d.should.eql(source.d)
      target.e.should.eql(source.e)
      target.f.should.eql(source.f)
      target.g.should.eql(source.g)
      target.h.should.eql(source.h)
    })

    it('should optionally not be assigned', () => {
      let schema = {
        properties: {
          a: { default: [ 1, 2, 3 ] },
          b: { default: [ 2, 3, 4 ] },
          c: { default: [ 3, 4, 5 ] },
          d: { default: [ 4, 5, 6 ] }
        }
      }

      let fn = Initializer.compile(schema)

      let target = {}
      let source = {}

      fn(target, source, { defaults: false })

      target.should.not.have.property('a')
      target.should.not.have.property('b')
      target.should.not.have.property('c')
      target.should.not.have.property('d')
    })
  })

  /**
   * Object root first-level empty object default values
   */
  describe('object root first-level empty object default values', () => {})

  /**
   * Object root first-level empty array default values
   */
  describe('object root first-level empty array default values', () => {})

  /**
   * Object root nth-level leaf primitive default values
   */
  describe('object root nth-level leaf primitive default values', () => {
    it('should be assigned when source values are not present', () => {
      let schema = {
        properties: {
          a: {
            properties: {
              b: { default: true },
              c: { default: 123 },
              d: { default: 4.56 },
              e: { default: 'value' }
            }
          },
          f: {
            properties: {
              g: {
                properties: {
                  h: {
                    properties: {
                      i: { default: true },
                      j: { default: 234 },
                      k: { default: 5.67 },
                      l: { default: 'value' }
                    }
                  },
                  m: { default: true }
                }
              }
            }
          }
        }
      }

      let fn = Initializer.compile(schema)

      let target = {}
      let source = {}

      fn(target, source)

      target.a.b.should.equal(true)
      target.a.c.should.equal(123)
      target.a.d.should.equal(4.56)
      target.a.e.should.equal('value')
      target.f.g.h.i.should.equal(true)
      target.f.g.h.j.should.equal(234)
      target.f.g.h.k.should.equal(5.67)
      target.f.g.h.l.should.equal('value')
      target.f.g.m.should.equal(true)
    })

    it('should be assigned when default values are falsy', () => {
      let schema = {
        properties: {
          a: {
            properties: {
              b: { default: undefined },
              c: { default: null },
              d: { default: false },
              e: { default: '' },
              f: { default: 0 }
            }
          },
          g: {
            properties: {
              h: {
                properties: {
                  i: {
                    properties: {
                      j: { default: undefined },
                      k: { default: null },
                      l: { default: false },
                      m: { default: '' },
                      n: { default: 0 }
                    }
                  },
                  o: { default: undefined }
                }
              }
            }
          }
        }
      }

      let fn = Initializer.compile(schema)

      let target = {}
      let source = {}

      fn(target, source)

      target.a.should.have.property('b')
      expect(target.a.b).to.equal(undefined)
      expect(target.a.c).to.equal(null)
      target.a.d.should.equal(false)
      target.a.e.should.equal('')
      target.a.f.should.equal(0)

      target.g.h.i.should.have.property('j')
      expect(target.g.h.i.j).to.equal(undefined)
      expect(target.g.h.i.k).to.equal(null)
      target.g.h.i.l.should.equal(false)
      target.g.h.i.m.should.equal('')
      target.g.h.i.n.should.equal(0)

      target.g.h.should.have.property('o')
      expect(target.g.h.o).to.equal(undefined)
    })

    it('should be assigned when default types do not match property types', () => {
      let schema = {
        properties: {
          a: {
            properties: {
              b: { type: 'array', default: undefined },
              c: { type: 'boolean', default: null },
              d: { type: 'integer', default: false },
              e: { type: 'number', default: '' },
              f: { type: 'null', default: 0 }
            }
          },
          g: {
            properties: {
              h: {
                properties: {
                  i: {
                    properties: {
                      j: { type: 'object', default: 'value' },
                      k: { type: 'string', default: 1.23 },
                      l: { type: 'undefined', default: 456 },
                      m: { type: 'array', default: 'not array' },
                      n: { type: 'boolean', default: 'not boolean' }
                    }
                  },
                  o: { type: 'integer', default: true }
                }
              }
            }
          }
        }
      }

      let fn = Initializer.compile(schema)

      let target = {}
      let source = {}

      fn(target, source)

      target.a.should.have.property('b')
      expect(target.a.b).to.equal(undefined)
      expect(target.a.c).to.equal(null)
      target.a.d.should.equal(false)
      target.a.e.should.equal('')
      target.a.f.should.equal(0)
      target.g.h.i.j.should.equal('value')
      target.g.h.i.k.should.equal(1.23)
      target.g.h.i.l.should.equal(456)
      target.g.h.i.m.should.equal('not array')
      target.g.h.i.n.should.equal('not boolean')
      target.g.h.o.should.equal(true)
    })

    it('should be overridden when source values are present', () => {
      let schema = {
        properties: {
          a: {
            properties: {
              b: { default: true },
              c: { default: 123 },
              d: { default: 4.56 },
              e: { default: 'value' }
            }
          },
          f: {
            properties: {
              g: {
                properties: {
                  h: {
                    properties: {
                      i: { default: true },
                      j: { default: 234 },
                      k: { default: 5.67 },
                      l: { default: 'value' }
                    }
                  },
                  m: { default: true }
                }
              }
            }
          }
        }
      }

      let fn = Initializer.compile(schema)

      let target = {}
      let source = {
        a: {
          b: false,
          c: 345,
          d: 6.78,
          e: 'other'
        },
        f: {
          g: {
            h: {
              i: false,
              j: 456,
              k: 6.78,
              l: 'not default'
            },
            m: false
          }
        }
      }

      fn(target, source)
      target.should.eql(source)
    })

    it('should be overridden when source value types do not match', () => {
      let schema = {
        properties: {
          a: {
            properties: {
              b: { type: 'boolean', default: true },
              c: { type: 'integer', default: 123 },
              d: { type: 'null', default: null },
              e: { type: 'number', default: 4.56 }
            }
          },
          f: {
            properties: {
              g: {
                properties: {
                  h: {
                    properties: {
                      i: { type: 'string', default: 'value' },
                      j: { type: 'undefined', default: undefined }
                    }
                  },
                  m: { type: 'boolean', default: true }
                }
              }
            }
          }
        }
      }

      let fn = Initializer.compile(schema)

      let target = {}
      let source = {
        a: {
          b: 345,
          c: 6.78,
          d: 'other',
          e: false
        },
        f: {
          g: {
            h: {
              i: false,
              j: 890,
            },
            m: null
          }
        }
      }

      fn(target, source)
      target.should.eql(source)
    })

    it('should optionally not be assigned', () => {
      let schema = {
        properties: {
          a: {
            properties: {
              b: { default: true },
              c: { default: 123 },
              d: { default: 4.56 },
              e: { default: 'value' }
            }
          },
          f: {
            properties: {
              g: {
                properties: {
                  h: {
                    properties: {
                      i: { default: true },
                      j: { default: 234 },
                      k: { default: 5.67 },
                      l: { default: 'value' }
                    }
                  },
                  m: { default: true }
                }
              }
            }
          }
        }
      }

      let fn = Initializer.compile(schema)

      let target = {}
      let source = { a: { e: 'not default' } }

      fn(target, source, { defaults: false })
      target.should.eql(source)
    })
  })

  /**
   * Object root nth-level branch primitive default values
   */
  describe('object root nth-level branch primitive default values', () => {
    it('should be assigned when source values are not present', () => {
      let schema = {
        properties: {
          a: {
            properties: {
              b: {
                properties: {
                  c: { type: 'integer' }
                },
                default: { c: 3 }
              }
            }
          },
          d: {
            properties: {
              e: {
                properties: {
                  f: { type: 'boolean' }
                }
              }
            },
            default: { e: { f: true } }
          }
        }
      }

      let fn = Initializer.compile(schema)

      let target = {}
      let source = {}

      fn(target, source)

      target.should.eql({
        a: { b: { c: 3 } },
        d: { e: { f: true } }
      })
    })

    it('should be assigned when default values are falsy', () =>{
      let schema = {
        properties: {
          a: {
            properties: {
              b: {
                properties: {
                  c: { type: 'boolean' }
                },
                default: undefined
              },
              d: {
                properties: {
                  e: { type: 'integer' }
                },
                default: null
              },
              f: {
                properties: {
                  g: { type: 'null' }
                },
                default: false
              },
              h: {
                properties: {
                  i: { type: 'number' }
                },
                default: ''
              },
              j: {
                properties: {
                  k: { type: 'string' }
                },
                default: 0
              }
            }
          }
        }
      }

      let fn = Initializer.compile(schema)

      let target = {}
      let source = {}

      fn(target, source)

      target.should.eql({
        a: {
          b: undefined,
          d: null,
          f: false,
          h: '',
          j: 0
        }
      })
    })

    it('should be assigned when default types do not match property types', () => {
      let schema = {
        properties: {
          a: {
            properties: {
              b: {
                type: 'object',
                properties: {
                  c: { type: 'integer' },
                  d: { type: 'string' }
                },
                default: 3
              }
            }
          },
          e: {
            properties: {
              f: {
                type: 'array',
                items: [
                  {
                    properties: {
                      g: { type: 'boolean' }
                    }
                  }
                ],
                default: 5
              }
            }
          }
        }
      }

      let fn = Initializer.compile(schema)

      let target = {}
      let source = {}

      fn(target, source)

      target.should.eql({
        a: {
          b: 3
        },
        e: {
          f: 5
        }
      })
    })

    it('should be overridden when source values are present', () => {
      let schema = {
        properties: {
          a: {
            properties: {
              b: {
                properties: {
                  c: { type: 'integer' }
                },
                default: { c: 3 }
              }
            }
          },
          d: {
            properties: {
              e: {
                properties: {
                  f: { type: 'boolean' }
                }
              }
            },
            default: { e: { f: true } }
          }
        }
      }

      let fn = Initializer.compile(schema)

      let target = {}
      let source = {
        a: { b: { c: 7 } },
        d: { e: { f: false, g: true } }
      }

      fn(target, source)

      target.should.eql({
        a: { b: { c: 7 } },
        d: { e: { f: false } }
      })
    })

    it('should be overridden when source value types do not match', () => {
      let schema = {
        properties: {
          a: {
            b: {
              c: { type: 'boolean' }
            },
            default: {}
          }
        }
      }

      let fn = Initializer.compile(schema)

      let target = {}
      let source = {
        a: { b: null }
      }

      fn(target, source)
      target.should.eql(source)
    })

    it('should optionally not be assigned', () => {
      let schema = {
        properties: {
          a: {
            properties: {
              b: {
                properties: {
                  c: { type: 'integer' }
                },
                default: { c: 3 }
              }
            }
          },
          d: {
            properties: {
              e: {
                properties: {
                  f: { type: 'boolean' }
                }
              }
            },
            default: { e: { f: true } }
          }
        }
      }

      let fn = Initializer.compile(schema)

      let target = {}
      let source = {}

      fn(target, source, { defaults: false })
      target.should.eql({})
    })
  })

  /**
   * Root object nth-level object default values
   */
  describe('object root nth-level object default values', () => {})

  /**
   * Root object nth-level array default values
   */
  describe('object root nth-level array default values', () => {})

  /**
   * Root object nth-level empty object default values
   */
  describe('object root nth-level empty object default values', () => {})

  /**
   * Root object nth-level empty array default values
   */
  describe('object root nth-level empty array default values', () => {})

  /**
   * Root object multi-Level defaults with no first level source value
   */
  describe('object root multi-level defaults with no first level source value', () => {})

  /**
   * Root object multi-Level defaults with first level source value
   */
  describe('object root multi-level defaults with first level source value', () => {
  })

  // all the above for array root
  // 3-level nesting for objects within arrays
  // 3-level nesting for arrays within objects

  describe('object root unspecified properties', () => {
    it('should include source values not defined in schema', () => {
      let schema = {
        properties: {
          a: {
            properties: {
              b: { type: 'string' },
              c: { type: 'boolean', default: true },
              d: {
                properties: {
                  e: { type: 'integer', default: 5 }
                }
              }
            }
          }
        }
      }

      let fn = Initializer.compile(schema)

      let target = {}
      let source = {
        a: {
          b: 'value',
          d: { f: 6 },
        },
        g: [ 1, 2, 3 ]
      }

      fn(target, source, { filter: false })

      target.should.eql({
        a: { b: 'value', c: true, d: { e: 5, f: 6 } },
        g: [ 1, 2, 3 ]
      })
    })
  })

  describe('type coercion', () => {})
})
