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
const Model = require(path.join(cwd, 'src', 'Model'))
const JSONSchema = require(path.join(cwd, 'src', 'JSONSchema'))

/**
 * Tests
 */
describe('Model', () => {

  describe('constructor', () => {
    let schema, instance

    before(() => {
      let schema = new JSONSchema({
        properties: {
          foo: { type: 'string', default: 'foo' },
          bar: { type: 'string', default: 'bar' }
        }
      })

      class MyModel extends Model {
        static get schema () {
          return schema
        }
      }

      instance = new MyModel()
    })

    it('should initialize from the schema', () => {
      instance.foo.should.equal('foo')
      instance.bar.should.equal('bar')
    })
  })

})
