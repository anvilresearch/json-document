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
const JWKSetSchema = require('./schemas/JWKSetSchema')

const jwks = `{
  "keys": [
    {
      "alg": "RS256",
      "e": "AQAB",
      "ext": true,
      "key_ops": [
        "verify"
      ],
      "kid": "eGBZycCgNSg",
      "kty": "RSA",
      "n": "vhTKjSEk7Z14eyXofi0fqREjaf2xwb82e9zb7rrdEFihu64wtOjf1OTYaEwfXJvI0Mr5ejI6xW7QV_OR52jO4WGPElubxtFzvggJc8rfKA8XYztj1_j1lCxW8RmWL07c84Wz3WyyzW8CaerthfxooVZbKNbrIWfFAlZTVHw7RdqANTwmR_rKwZxFxcfcQ2LTWsBGyZeDWlap4pZN8jTyeDXxN6oXuA8Uf9e6D40HkltyyzwY9vP3RzGmNaeuudPcx317EM2fn70D66cQfN_D9y9z68cJwnzufZ7oD1YGaS1zQjZp_ROx7H26U1-yizDq3vJEGXlLGgQWLOULdMtVlw"
    },
    {
      "alg": "RS384",
      "e": "AQAB",
      "ext": true,
      "key_ops": [
        "verify"
      ],
      "kid": "urM8NTU1pP4",
      "kty": "RSA",
      "n": "xbJ5juGmpROjOQW4N3-uulveenednxgEeZpfOhaLMc3QAhymm-gsUJKI1-NMj0k-GM7G2BLJOwWJP9NYYi07yNlX5AgtjvYc0ActMhrC6YjZP5K2p-zibzu6t9xA3pyQsReQmDu5nUKIx7zUUVaHkJ5yC1_heGdYqbZ-SFnawYYwQL-XaovXb8yktRKn6cl1qzBqjhgX6aQnnr4UYdy51WTOC0le0UaSRxviQCFcBuVDsiKxaTYWcutgUFl3Sus2KKnGKo3XP1TAiuPQS_3fKoDg9nYlf3R2k43dMNId3_tt9OKSqg8Yt2UUuvtza0UOm87JoCelLhK_R4Kpu4lVaw"
    },
    {
      "alg": "RS512",
      "e": "AQAB",
      "ext": true,
      "key_ops": [
        "verify"
      ],
      "kid": "4sRR9uQDKEo",
      "kty": "RSA",
      "n": "7XDjAjHUu1fLP9knHYH8wGL62JOtpKtsTBUv95Hfpso-bdMjrLhI1tYHabvYfbUCMwCLrLRw6CWyRikfu6wLI2tXICyi9JEkH7yu2D4J_tTZtQhrWl-5KGH_UUajF2KblMOXrpOBeLmYTrb0BBqkIGcoiNKk-YFunEyISw_jnDedJ8_FTGOTGktXeHgpxrMf2O1H2oP0HPbcoLF-oKU01R4L8lteMPnnZXSnbRITP4LyVGhhPkN-49bK8-f9U0swnktITmMEI0ASEvf63u3wzApjftQCEH3IzW3LzjTM7nTnqf04mN9mAjrqvFJtOXtF9zkqF5323HaTqui4LDXCSw"
    }
  ]
}
`

/**
 * Tests
 */
describe('JSONSchema validation', () => {
  describe('JWK Set schema', () => {
    it('should validate', () => {
      let validation = JWKSetSchema.validate(JSON.parse(jwks))
      console.log(validation)
      expect(validation.valid).to.equal(true)
    })
  })
})
