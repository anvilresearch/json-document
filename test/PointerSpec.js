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
const Pointer = require(path.join(cwd, 'src', 'Pointer'))

/**
 * Tests
 */
describe('Pointer', () => {

  describe('constructor', () => {
    it('should set the expression')
  })

  describe('escape', () => {})

  describe('unescape', () => {
    it('should transform each occurence of "~1" to "/"')
    it('should transform each occurence of "~0" to "~"')
    it('should not transform "~01" to "/"')
  })

  describe('parseJSONString', () => {
    describe('with a valid string argument', () => {
      it('should recognize a whole document reference')
      it('should recognize an object property')
      it('should recognize an array element')
      it('should recognize a root reference')
      it('should recognize an escaped "/" character')
      it('should recognize "%"')
      it('should recognize "^"')
      it('should recognize "|"')
      it('should recognize an escaped quotation mark character')
      it('should recognize an escaped reverse solidus character')
      it('should recognize an escaped control character')
      it('should recognize a space character')
      it('should recognize an escaped "~" character')
      it('should recognize the "-" element of an array')
    })

    describe('with an invalid string argument', () => {
      it('should create an error condition')
    })

    describe('with a non-string argument', () => {
      it('should create an error condition')
    })
  })

  describe('parseURIFragmentIdentifier', () => {
    describe('with a valid URI fragment identifier', () => {

    })

    describe('with an invalid URI fragment identifier', () => {
      it('should create an error condition')
    })

    describe('with a non-valid URI fragment identifier', () => {
      it('should create an error condition')
    })
  })

  describe('parse (static)', () => {
    it('should return a pointer instance')
  })

  describe('get', () => {
    describe('with valid reference', () => {
      it('should return the referenced value from a source object')
    })

    describe('with non-matched reference', () => {
      it('should handle an error condition')
    })
  })

  describe('set', () => {
    it('should set the provide value on a target object')
  })

  describe('del', () => {
    it('should remove the referenced value from a target object')
  })

  describe('toString', () => {
    it('should render a JSON string representation')
  })

  describe('toURIFragmentIdentifier', () => {
    it('should render a URI fragment identifier representation')
  })
})
