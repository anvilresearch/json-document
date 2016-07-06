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
const IntegerValidation = require('../../src/validation/IntegerValidation')

/**
 * Tests
 */
describe('IntegerValidation', () => {
  describe('type', () => {})
  describe('multipleOf', () => {})
  describe('maximum', () => {})
  describe('exclusiveMaximum', () => {})
  describe('minimum', () => {})
  describe('exclusiveMinimum', () => {})
  describe('compile', () => {})
})
