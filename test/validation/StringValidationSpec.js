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
const StringValidation = require('../../src/validation/StringValidation')

/**
 * Tests
 */
describe('StringValidation', () => {
  describe('type', () => {})
  describe('maxLength', () => {})
  describe('minLength', () => {})
  describe('defaultValue', () => {})
  describe('pattern', () => {})
  describe('format', () => {})
  describe('compile', () => {})
})
