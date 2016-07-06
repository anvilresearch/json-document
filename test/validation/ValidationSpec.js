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
const Validation = require('../../src/validation/Validation')

/**
 * Tests
 */
describe('Validation', () => {
  describe('constructor', () => {})
  describe('enum', () => {})
  describe('allOf', () => {})
  describe('anyOf', () => {})
  describe('oneOf', () => {})
  describe('not', () => {})
  describe('definitions', () => {})
  describe('compile', () => {})

  describe('determineType', () => {
    describe('with defined and supported type', () => {
      it('should it should recognize "object" type', () => {
        Validation.determineType({ type: 'array' }).should.equal('array')
      })

      it('should it should recognize "boolean" type', () => {
        Validation.determineType({ type: 'boolean' }).should.equal('boolean')
      })

      it('should it should recognize "integer" type', () => {
        Validation.determineType({ type: 'integer' }).should.equal('integer')
      })

      it('should it should recognize "number" type', () => {
        Validation.determineType({ type: 'number' }).should.equal('number')
      })

      it('should it should recognize "null" type', () => {
        Validation.determineType({ type: 'null' }).should.equal('null')
      })

      it('should it should recognize "object" type', () => {
        Validation.determineType({ type: 'object' }).should.equal('object')
      })

      it('should it should recognize "string" type', () => {
        Validation.determineType({ type: 'string' }).should.equal('string')
      })
    })

    describe('with defined and unsupported type', () => {
      it('should throw an error', () => {
        expect(() => {
          Validation.determineType({ type: 'unsupported' })
        }).to.throw('Can\'t determine type of')
      })
    })

    describe('with object keywords', () => {
      it('should infer "object" type from "properties"', () => {
        Validation.determineType({ properties: {} }).should.equal('object')
      })

      it('should infer "object" type from "patternProperties"', () => {
        Validation.determineType({ patternProperties: {} }).should.equal('object')
      })

      it('should infer "object" type from "additionalProperties"', () => {
        Validation.determineType({
          additionalProperties:{}
        }).should.equal('object')
      })

      it('should infer "object" type from "minProperties"', () => {
        Validation.determineType({ minProperties: {} }).should.equal('object')
      })

      it('should infer "object" type from "maxProperties"', () => {
        Validation.determineType({ maxProperties: {} }).should.equal('object')
      })

      it('should infer "object" type from "dependencies"', () => {
        Validation.determineType({ dependencies: {} }).should.equal('object')
      })

      it('should infer "object" type from "required"', () => {
        Validation.determineType({ required: {} }).should.equal('object')
      })
    })

    describe('with array keywords', () => {
      it('should infer "array" type from "minItems"', () => {
        Validation.determineType({ minItems: {} }).should.equal('array')
      })

      it('should infer "array" type from "maxItems"', () => {
        Validation.determineType({ maxItems: {} }).should.equal('array')
      })

      it('should infer "array" type from "items"', () => {
        Validation.determineType({ items: {} }).should.equal('array')
      })

      it('should infer "array" type from "uniqueItems"', () => {
        Validation.determineType({ uniqueItems: {} }).should.equal('array')
      })
    })

    describe('with string keywords', () => {
      it('should infer "string" type from "minLength"', () => {
        Validation.determineType({ minLength: {} }).should.equal('string')
      })

      it('should infer "string" type from "maxLength"', () => {
        Validation.determineType({ maxLength: {} }).should.equal('string')
      })

      it('should infer "string" type from "pattern"', () => {
        Validation.determineType({ pattern: {} }).should.equal('string')
      })
    })

    describe('with object and array keywords', () => {
      it('should infer "object" type', () => {
        Validation.determineType({
          properties: {},
          items: []
        }).should.equal('object')
      })
    })

    describe('with object and string keywords', () => {
      it('should infer "object" type', () => {
        Validation.determineType({
          properties: {},
          minLength: 1337
        }).should.equal('object')
      })
    })

    describe('with array and string keywords', () => {
      it('should infer "array" type', () => {
        Validation.determineType({
          items: [],
          minLength: 1337
        }).should.equal('array')
      })
    })

    describe('with number keywords and missing type', () => {
      it('should throw an error', () => {
        expect(() => {
          Validation.determineType({ min: 4 })
        }).to.throw('Invalid schema definition')
      })
    })

    describe('with other uninferrable type', () => {
      it('should throw an error', () => {
        expect(() => {
          Validation.determineType({ foo: 'bar' })
        }).to.throw('Invalid schema definition')
      })
    })
  })
})
