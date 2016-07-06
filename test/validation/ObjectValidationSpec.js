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
const ObjectValidation = require('../../src/validation/ObjectValidation')

/**
 * Tests
 */
describe('ObjectValidation', () => {
  describe('type', () => {})
  describe('maxProperties', () => {})
  describe('minProperties', () => {})
  describe('defaultValue', () => {})
  describe('required', () => {})
  describe('additionalProperties', () => {})
  describe('properties', () => {})
  describe('patternProperties', () => {})
  describe('dependencies', () => {})
  describe('schemaDependencies', () => {})
  describe('propertyDependencies', () => {})
  describe('compile', () => {})
})
