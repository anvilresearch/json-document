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
//const JSONSchema = require(path.join(cwd, 'src', 'JSONSchema'))
const JSONSchema = require('../src/JSONSchema')

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
