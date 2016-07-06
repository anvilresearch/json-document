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
const NullValidation = require('../../src/validation/NullValidation')

/**
 * Tests
 */
describe('NullValidation', () => {
  describe('type', () => {})
  describe('compile', () => {})
})
