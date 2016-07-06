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
})
