'use strict'

/**
 * Test dependencies
 */
const assert = require('assert')
const suite = require('json-schema-test-suite')

/**
 * Code under test
 */
//const JSONSchema = require('../src/JSONSchema')
const Validator = require('../src/Validator')

function JSONSchemaFactory (schema, options) {
  if (typeof schema === 'string') {
    schema = JSON.parse(text)
  }

  return {
    validate: function (json) {
      try {
        let fn = Validator.compile(schema)
        return fn(json)
        //let compiled = new JSONSchema(schema)
        //return compiled.validate(json)
      } catch (err) {
        console.log(err)
        return { valid: false, errors: [err.message] }
      }
    }
  }
}

/**
 * Test runner
 */
run(JSONSchemaFactory, 'draft4', {
  name: 'feldspar',
  draft: 'draft4',
  results: {
    pass: 0,
    fail: 0
  }
})


/**
 * Run Tests
 */
function run (factory, draft, validatorResult) {
  describe(draft, () => {
    let tests = suite.testSync(factory, {}, void 0, draft)

    tests.forEach(test => {
      let {name, schemas} = test

      describe(name, () => {
        schemas.forEach(schema => {
          let {description} = schema

          describe(description, () => {
            schema.tests.forEach(assertion => {

              it(assertion.description, () => {
                let result = assertion.result

                if (result.valid === assertion.valid) {
                  //console.log('SCHEMA', schema.schema)
                  //console.log('DATA', assertion.data)
                  //console.log('EXPECTED', assertion.valid)
                  //console.log('RESULT', result)
                  validatorResult.results.pass++
                } else {
                  console.log('SCHEMA', schema.schema)
                  console.log('DATA', assertion.data)
                  console.log('EXPECTED', assertion.valid)
                  console.log('RESULT', result)
                  validatorResult.results.fail++
                }

                assert.equal(result.valid, assertion.valid)
              })
            })
          })
        })
      })
    })
  })
}

/**
 * Test Dependencies
 */
//const assert = require('assert')
//const glob = require('glob')
//const util = require('util')
//const suite = require('json-schema-test-suite')

/**
 * Drafts
 */
//const drafts = [ [>'draft3',<] 'draft4' ]

/**
 * Verify Suite
 */
//describe('verify test suite loads all json test files', function () {
//  let testMessage = 'The number of %s test groups should match the number of %s json files'
//  let errorMessage = 'the actual number of test groups was expected match the number of %s json files'

//  let allPattern = './tests/%s/**/*.json'
//  let requiredPattern = { glob: './tests/%s/**/*.json', ignore: './tests/%s/optional/*.json' }
//  let optionalPattern = './tests/%s/optional/*.json'
//  let minPattern = './tests/%s/**/min*.json'

//  let testPlans = [
//    { name: 'all', globPattern: allPattern },
//    { name: 'required', globPattern: requiredPattern, filter: suite.requiredOnlyFilter },
//    { name: 'optional', globPattern: optionalPattern, filter: suite.optionalOnlyFilter },
//    { name: '"min"-prefixed', globPattern: minPattern, filter: function (file) { return /^min/.test(file) } }
//  ]

//  function loadFiles(draft, globPattern) {
//    if (typeof globPattern == 'string') {
//      return glob.sync(util.format(globPattern, draft))
//    } else {
//      return glob.sync(util.format(globPattern.glob, draft), {
//        ignore: util.format(globPattern.ignore, draft)
//      })
//    }
//  }

//  function compareCount(draft, globPattern, filter, name) {
//    console.log('COMPARE COUNT', draft, globPattern, filter, name)
//    let tests = suite.loadSync({ filter: filter, draft: draft })
//    let files = loadFiles(draft, globPattern)

//    assert.equal(tests.length, files.length, util.format(errorMessage, name))
//  }

//  // for the combination of draft directories and test plans, create a test case
//  // and verify the number of tests returned by the test suite is equal to the actual
//  // number of files that match the glob pattern.
//  drafts.forEach(function (draft) {
//    testPlans.forEach(function (pt) {
//      it(util.format(testMessage, draft, pt.name), function () {
//        compareCount(draft, pt.globPattern, pt.filter, pt.name)
//      })
//    })
//  })

//  // test helper functions loadRequiredSync and loadOptionalSync
//  drafts.forEach(function (draft) {
//    it(util.format('should load required %s tests', draft), function () {
//      let tests = suite.loadRequiredSync(draft)
//      let files = loadFiles(draft, requiredPattern)

//      assert.equal(tests.length, files.length, util.format(errorMessage, 'required'))
//    })

//    it(util.format('should load optional %s tests', draft), function () {
//      let tests = suite.loadOptionalSync(draft)
//      let files = loadFiles(draft, optionalPattern)

//      assert.equal(tests.length, files.length, util.format(errorMessage, 'optional'))
//    })
//  })

//})

/**
 * Validator Tests
 */
//describe('validator tests', function() {
//  let validatorResults = []

//  after(function() {
//    validatorResults.forEach(function(validator) {
//      console.log('\n******************************')
//      console.log('validator: %s (%s)', validator.name, validator.draft)
//      console.log('pass: ' + validator.results.pass)
//      console.log('fail: ' + validator.results.fail)
//    })
//  })

  /**
   * IMPLEMENTATION TESTS
   */
//  describe('feldspar validator tests', function () {
//    let JSONSchema = require('../src/JSONSchema')

//    function JSONSchemaFactory (schema, options) {
//      if (typeof schema === 'string') {
//        schema = JSON.parse(text)
//      }

//      return {
//        validate: function (json) {
//          try {
//            return JSONSchema.validate(json, schema)
//          } catch (err) {
//            return { valid: false, errors: [err.message] }
//          }
//        }
//      }
//    }

//    drafts.forEach(draft => {
//      let result = { name: 'feldspar', draft, results: { pass: 0, fail: 0 }}
//      validatorResults.push(result)
//      //runTests(JSONSchemaFactory, draft, result)
//    })
//  })
//})
