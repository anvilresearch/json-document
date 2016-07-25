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
const formats = require(path.join(cwd, 'src', 'Formats'))
const Formats = formats.constructor

/**
 * Tests
 */
describe('Formats', () => {
  describe('module', () => {
    it('should be an instance of Formats', () => {
      expect(formats).to.be.instanceof(Formats)
    })
  })

  describe('initialize', () => {
    it('should return an instance of Formats', () => {
      Formats.initialize().should.be.instanceof(Formats)
    })
  })

  describe('register', () => {
    it('should require "name" argument to be a string', () => {
      expect(() => {
        formats.register(null)
      }).to.throw('Format name must be a string')
    })

    it('should validate pattern is allowed by JSON Schema patterns')

    it('should add the pattern to the map', () => {
      formats.register('ends-with-foo', /foo$/)
      formats.get('ends-with-foo').should.be.instanceof(RegExp)
    })
  })

  describe('resolve', () => {
    it('should return a known pattern', () => {
      formats.resolve('uri').should.be.instanceof(RegExp)
    })

    it('should throw an error with unknown pattern', () => {
      expect(() => {
        formats.resolve('unknown')
      }).to.throw('Unknown JSON Schema format.')
    })
  })

  describe('date-time', () => {})
  describe('uri', () => {})
  describe('email', () => {})
  describe('ipv4', () => {})
  describe('ipv6', () => {})
  describe('hostname', () => {})
})
