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
const JSONDocument = require(path.join(cwd, 'src', 'JSONDocument'))
const JSONSchema = require(path.join(cwd, 'src', 'JSONSchema'))

/**
 * Tests
 */
describe.only('JSONDocument', () => {

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
    let doc, Doc, data, options

    beforeEach(() => {
      Doc = class extends JSONDocument {}
      sinon.stub(Doc.prototype, 'initialize')

      data = {}
      options = {}
      doc = new Doc(data, options)
    })

    afterEach(() => {
      Doc.prototype.initialize.restore()
    })

    it('should initialize instance', () => {
      doc.initialize.should.have.been.calledWith(data, options)
    })
  })

  /**
   * Initialize
   */
  describe('initialize', () => {
    let schema, doc, Doc, data, options

    before(() => {
      schema = { initialize: sinon.spy() }

      Doc = class extends JSONDocument {
        static get schema () {
          return schema
        }
      }

      doc = new Doc()

      data = {}
      options = {}
      doc.initialize(data, options)
    })

    it('should initialize instance with schema', () => {
      schema.initialize.should.have.been.calledWith(data, options)
    })
  })

  /**
   * Validate
   */
  describe('validate', () => {
    let schema, alternate, doc, Doc, data, options

    beforeEach(() => {
      schema = {
        initialize: sinon.spy(),
        validate: sinon.spy()
      }

      alternate = {
        initialize: sinon.spy(),
        validate: sinon.spy()
      }

      Doc = class extends JSONDocument {
        static get schema () {
          return schema
        }
      }

      doc = new Doc()
    })

    it('should validate instance with defined schema', () => {
      doc.validate()
      schema.validate.should.have.been.calledWith(doc)
    })

    it('should validate instance with schema argument', () => {
      doc.validate(alternate)
      schema.validate.should.not.have.been.called
      alternate.validate.should.have.been.calledWith(doc)
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
