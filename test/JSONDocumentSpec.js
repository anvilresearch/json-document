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
const JSONDocument = require('../src/JSONDocument')
const JSONSchema = require('../src/JSONSchema')

/**
 * Tests
 */
describe('JSONDocument', () => {

  /**
   * Schema
   */
  describe('static get schema', () => {
    it('should throw an error', () => {
      expect(() => {
        JSONDocument.schema
      }).to.throw('Schema must be defined by classes extending JSONDocument')
    })
  })

  /**
   * Constructor
   */
  describe('constructor', () => {
    let Doc, doc, data, options

    before(() => {
      Doc = class extends JSONDocument {
        static get schema () {
          return new JSONSchema({
            type: 'object',
            properties: {
              foo: { type: 'string', default: 'bar' }
            }
          })
        }
      }

      doc = new Doc()
    })

    it('should initialize instance', () => {
      doc.foo.should.equal('bar')
    })
  })

  /**
   * Initialize
   */
  describe('initialize', () => {
    let Doc, doc, data, options

    before(() => {
      Doc = class extends JSONDocument {
        static get schema () {
          return new JSONSchema({
            type: 'object',
            properties: {
              foo: { type: 'string', default: 'bar' }
            }
          })
        }
      }

      doc = new Doc()
    })

    it('should initialize instance with schema', () => {
      doc.foo.should.equal('bar')
    })
  })

  /**
   * Validate
   */
  describe('validate', () => {
    let Doc, doc, data, options, alternate

    before(() => {
      Doc = class extends JSONDocument {
        static get schema () {
          return new JSONSchema({
            type: 'object',
            properties: {
              foo: { maxLength: 3 }
            }
          })
        }
      }

      alternate = new JSONSchema({
        properties: { foo: { minLength: 9 } }
      })

      doc = new Doc({ foo: 'invalid' })
    })

    it('should validate instance with defined schema', () => {
      doc.validate().errors[0].message.should.equal('too long')
    })

    it('should validate instance with schema argument', () => {
      doc.validate(alternate).errors[0].message.should.equal('too short')
    })
  })

  /**
   * Patch
   */
  describe('patch', () => {
    it('should apply patch to instance')
  })

  /**
   * Select
   */
  describe('select', () => {
    it('should filter object properties')
  })

  /**
   * Project
   */
  describe('project', () => {
    it('should project from an instance of Mapping')
    it('should project from a mapping description')
    it('should project from a mapping name')
  })

  /**
   * Serialize
   */
  describe('static serialize', () => {
    it('should stringify value to JSON')
  })

  /**
   * Deserialize
   */
  describe('static deserialize', () => {
    it('should parse JSON')
  })
})
