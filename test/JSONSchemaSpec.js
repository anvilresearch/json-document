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

  describe.only('determineType', () => {
    describe('with defined and supported type', () => {
      it('should it should recognize "object" type', () => {
        JSONSchema.determineType({ type: 'array' }).should.equal('array')
      })

      it('should it should recognize "boolean" type', () => {
        JSONSchema.determineType({ type: 'boolean' }).should.equal('boolean')
      })

      it('should it should recognize "integer" type', () => {
        JSONSchema.determineType({ type: 'integer' }).should.equal('integer')
      })

      it('should it should recognize "number" type', () => {
        JSONSchema.determineType({ type: 'number' }).should.equal('number')
      })

      it('should it should recognize "null" type', () => {
        JSONSchema.determineType({ type: 'null' }).should.equal('null')
      })

      it('should it should recognize "object" type', () => {
        JSONSchema.determineType({ type: 'object' }).should.equal('object')
      })

      it('should it should recognize "string" type', () => {
        JSONSchema.determineType({ type: 'string' }).should.equal('string')
      })
    })

    describe('with defined and unsupported type', () => {
      it('should throw an error', () => {
        expect(() => {
          JSONSchema.determineType({ type: 'unsupported' })
        }).to.throw('Can\'t determine type of')
      })
    })

    describe('with object keywords', () => {
      it('should infer "object" type from "properties"', () => {
        JSONSchema.determineType({ properties: {} }).should.equal('object')
      })

      it('should infer "object" type from "patternProperties"', () => {
        JSONSchema.determineType({ patternProperties: {} }).should.equal('object')
      })

      it('should infer "object" type from "additionalProperties"', () => {
        JSONSchema.determineType({
          additionalProperties:{}
        }).should.equal('object')
      })

      it('should infer "object" type from "minProperties"', () => {
        JSONSchema.determineType({ minProperties: {} }).should.equal('object')
      })

      it('should infer "object" type from "maxProperties"', () => {
        JSONSchema.determineType({ maxProperties: {} }).should.equal('object')
      })

      it('should infer "object" type from "dependencies"', () => {
        JSONSchema.determineType({ dependencies: {} }).should.equal('object')
      })

      it('should infer "object" type from "required"', () => {
        JSONSchema.determineType({ required: {} }).should.equal('object')
      })
    })

    describe('with array keywords', () => {
      it('should infer "array" type from "minItems"', () => {
        JSONSchema.determineType({ minItems: {} }).should.equal('array')
      })

      it('should infer "array" type from "maxItems"', () => {
        JSONSchema.determineType({ maxItems: {} }).should.equal('array')
      })

      it('should infer "array" type from "items"', () => {
        JSONSchema.determineType({ items: {} }).should.equal('array')
      })

      it('should infer "array" type from "uniqueItems"', () => {
        JSONSchema.determineType({ uniqueItems: {} }).should.equal('array')
      })
    })

    describe('with string keywords', () => {
      it('should infer "string" type from "minLength"', () => {
        JSONSchema.determineType({ minLength: {} }).should.equal('string')
      })

      it('should infer "string" type from "maxLength"', () => {
        JSONSchema.determineType({ maxLength: {} }).should.equal('string')
      })

      it('should infer "string" type from "pattern"', () => {
        JSONSchema.determineType({ pattern: {} }).should.equal('string')
      })
    })

    describe('with object and array keywords', () => {
      it('should infer "object" type', () => {
        JSONSchema.determineType({
          properties: {},
          items: []
        }).should.equal('object')
      })
    })

    describe('with object and string keywords', () => {
      it('should infer "object" type', () => {
        JSONSchema.determineType({
          properties: {},
          minLength: 1337
        }).should.equal('object')
      })
    })

    describe('with array and string keywords', () => {
      it('should infer "array" type', () => {
        JSONSchema.determineType({
          items: [],
          minLength: 1337
        }).should.equal('array')
      })
    })

    describe('with number keywords and missing type', () => {
      it('should throw an error', () => {
        expect(() => {
          JSONSchema.determineType({ min: 4 })
        }).to.throw('Invalid schema definition')
      })
    })

    describe('with other uninferrable type', () => {
      it('should throw an error', () => {
        expect(() => {
          JSONSchema.determineType({ foo: 'bar' })
        }).to.throw('Invalid schema definition')
      })
    })
  })
})
