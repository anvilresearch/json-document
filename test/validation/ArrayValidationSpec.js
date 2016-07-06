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
const ArrayValidation = require('../../src/validation/ArrayValidation')

/**
 * Tests
 */
describe('ArrayValidation', () => {
  describe('type', () => {})
  describe('additionalItems', () => {})
  describe('items', () => {})
  describe('maxItems', () => {})
  describe('minItems', () => {})
  describe('uniqueItems', () => {})
  describe('compile', () => {})
})
