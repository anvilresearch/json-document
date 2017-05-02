'use strict'

/**
 * Test dependencies
 */
const chai = require('chai')

/**
 * Assertions
 */
chai.should()
let expect = chai.expect

/**
 * Code under test
 */
const JSONSchema = require('../src/JSONSchema')
const JWKSchema = require('./schemas/JWKSchema')

const jwk = `{
  "kid": "212OUymAqmI",
  "kty": "RSA",
  "alg": "RS256",
  "n": "pQEhHEjUCw8Dj5h4wbPWCX1EC6OrcmIvr_ejZS4mWYPFnq8Q_GI_R63mALFD_LCZTrcd_LaG0irmbhAGaYOe8bYl8gvDEyVgH-nK8GkPSWaW_3DXazXM2cT2lWmHoRUi3Eh6ouG-hEEU7D2rwstfAsp30BRRjrJFVqgu4hx3INTMiFhFDrKBfec-SR2JCJwttB9Tj8I-AaJSBkFcA4Q3xaYmrc-b0j7cVrCBqt6cZXuwoDEdGf3d-1eTiywEWYKi4eiOfw5tonwrgNCtVPk-q150nz6IckmiweROzrY8Mj0xfmPwfNK-H1KciPZ6eRWeHJLPJWslCuVLbqwRpLQzhQ",
  "e": "AQAB",
  "key_ops": [
    "verify"
  ],
  "ext": true
}
`

/**
 * Tests
 */
describe('JSONSchema validation', () => {
  describe('JWK schema', () => {
    it('should validate', () => {
      let validation = JWKSchema.validate(JSON.parse(jwk))
      console.log(validation)
      expect(validation.valid).to.equal(true)
    })
  })
})
