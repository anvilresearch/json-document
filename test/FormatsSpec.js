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
const formats = require('../src/Formats')
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
      formats['ends-with-foo'].should.be.instanceof(RegExp)
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

  describe('test', () => {
    it('should validate a value with a known known pattern', () => {
      formats.test('uri', '/').should.equal(true)
      formats.test('uri', '&').should.equal(false)
    })

    it('should throw an error with unknown pattern', () => {
      expect(() => {
        formats.test('unknown', 'value')
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
