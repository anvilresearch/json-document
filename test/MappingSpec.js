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
const Mapping = require(path.join(cwd, 'src', 'Mapping'))

/**
 * Tests
 */
describe('Mapping', () => {

  describe('constructor', () => {
    it('should cast JSON Pointer strings to Pointer objects')
  })

  describe('map', () => {
    let mapping, target, source

    beforeEach(() => {
      mapping = new Mapping({
        '/foo': '/foo/0',
        '/bar': '/alpha/bravo'
      })

      target = {}

      source = {
        foo: ['bar'],
        alpha: {
          bravo: 'charlie'
        }
      }

      mapping.map(target, source)
    })

    it('should read from source and write to target', () => {
      target.foo.should.equal('bar')
      target.bar.should.equal('charlie')
    })
  })

  describe('project', () => {
    let mapping, target, source

    beforeEach(() => {
      mapping = new Mapping({
        '/foo': '/foo/0',
        '/bar': '/alpha/bravo'
      })

      source = {
        foo: 'bar',
        bar: 'charlie'
      }

      target = {}

      mapping.project(source, target)
    })

    it('should read from source and write to target', () => {
      console.log('TARGET', target)
      target.foo[0].should.equal('bar')
      target.alpha.bravo.should.equal('charlie')
    })
  })

})
