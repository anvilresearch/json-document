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
const JSONSchema = require(path.join(cwd, 'src', 'JSONSchema'))

/**
 * Tests
 */
describe('JSONSchema', () => {

  describe('constructor', () => {
    it('should accept JSON string argument')

    it('should create JSONSchema instance', () => {
      let schema = new JSONSchema({ properties: {} })
      expect(schema).to.be.instanceof(JSONSchema)
    })

    it('should deep copy argument properties', () => {
      // TODO deep copy
      let data = { properties: { foo: { type: 'string' } } }
      let schema = new JSONSchema(data)
      schema.properties.should.equal(data.properties)
    })

    it('should define initialize function', () => {
      let data = { properties: { foo: { type: 'string' } } }
      let schema = new JSONSchema(data)
      let source = { foo: 'bar' }
      let target = {}
      schema.initialize(target, source)
      target.foo.should.equal('bar')
    })

    it('should define validate function')
  })

  describe('extend', () => {})

})

//  describe('constructor', () => {
//    it('should cast JSON Pointer strings to Pointer objects')
//  })

//  describe('map', () => {
//    let mapping, target, source

//    beforeEach(() => {
//      mapping = new Mapping({
//        '/foo': '/foo/0',
//        '/bar': '/alpha/bravo'
//      })

//      target = {}

//      source = {
//        foo: ['bar'],
//        alpha: {
//          bravo: 'charlie'
//        }
//      }

//      mapping.map(target, source)
//    })

//    it('should read from source and write to target', () => {
//      target.foo.should.equal('bar')
//      target.bar.should.equal('charlie')
//    })
//  })

//  describe('project', () => {
//    let mapping, target, source

//    beforeEach(() => {
//      mapping = new Mapping({
//        '/foo': '/foo/0',
//        '/bar': '/alpha/bravo'
//      })

//      source = {
//        foo: 'bar',
//        bar: 'charlie'
//      }

//      target = {}

//      mapping.project(source, target)
//    })

//    it('should read from source and write to target', () => {
//      console.log('TARGET', target)
//      target.foo[0].should.equal('bar')
//      target.alpha.bravo.should.equal('charlie')
//    })
//  })

//})
