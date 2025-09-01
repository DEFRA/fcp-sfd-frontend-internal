// Test framework dependencies
import { describe, test, expect, beforeEach } from 'vitest'

// Thing under test
import { businessEmailSchema } from '../../../../src/schemas/business/business-email-schema.js'

describe('business email schema', () => {
  let payload
  let schema

  beforeEach(() => {
    schema = businessEmailSchema

    payload = { businessEmail: 'example@email.com' }
  })

  describe('when valid data is provided', () => {
    test('it confirms the data is valid', () => {
      const { error, value } = schema.validate(payload, { abortEarly: false })

      expect(error).toBeUndefined()
      expect(value).toEqual(payload)
    })
  })

  describe('when invalid data is provided', () => {
    describe('because "businessEmail" is missing', () => {
      beforeEach(() => {
        payload.businessEmail = ''
      })

      test('it fails validation', () => {
        const { error, value } = schema.validate(payload, { abortEarly: false })

        expect(error.details[0]).toEqual(expect.objectContaining({
          message: 'Enter business email address',
          path: ['businessEmail'],
          type: 'string.empty'
        }))
        expect(value).toEqual(payload)
      })
    })

    describe('because "businessEmail" is not an email', () => {
      beforeEach(() => {
        payload.businessEmail = 'This is not an email'
      })

      test('it fails validation', () => {
        const { error, value } = schema.validate(payload, { abortEarly: false })

        expect(error.details[0]).toEqual(expect.objectContaining({
          message: 'Enter an email address, like name@example.com',
          path: ['businessEmail'],
          type: 'string.email'
        }))
        expect(value).toEqual(payload)
      })
    })

    describe('because "businessEmail" is longer than 254 characters', () => {
      beforeEach(() => {
        payload.businessEmail = 'reallyreallyreallyreallyreallyreallyreallyreallyreallylongemail@exampleeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeexample.cooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooo.ukkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk.com'
      })

      test('it fails validation', () => {
        const { error, value } = schema.validate(payload, { abortEarly: false })

        expect(error.details[0]).toEqual(expect.objectContaining({
          message: 'Business email address must be 254 characters or less',
          path: ['businessEmail'],
          type: 'string.max'
        }))
        expect(value).toEqual(payload)
      })
    })
  })
})
