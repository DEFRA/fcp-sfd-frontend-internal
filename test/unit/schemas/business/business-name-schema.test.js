// Test framework dependencies
import { describe, test, expect, beforeEach } from 'vitest'

// Thing under test
import { businessNameSchema } from '../../../../src/schemas/business/business-name-schema.js'

describe('business name schema', () => {
  let payload
  let schema

  beforeEach(() => {
    schema = businessNameSchema

    payload = {
      businessName: 'Agile Farm Ltd'
    }
  })

  describe('when valid data is provided', () => {
    test('it confirms the data is valid', () => {
      const { error, value } = schema.validate(payload, { abortEarly: false })

      expect(error).toBeUndefined()
      expect(value).toEqual(payload)
    })
  })

  describe('when invalid data is provided', () => {
    describe('because "businessName" is missing', () => {
      beforeEach(() => {
        delete payload.businessName
      })

      test('it fails validation', () => {
        const { error, value } = schema.validate(payload, { abortEarly: false })

        expect(error.details[0]).toEqual(expect.objectContaining({
          message: 'Enter business name',
          path: ['businessName'],
          type: 'any.required'
        }))
        expect(value).toEqual(payload)
      })
    })

    describe('because "businessName" is a empty string', () => {
      beforeEach(() => {
        payload.businessName = ''
      })

      test('it fails validation', () => {
        const { error, value } = schema.validate(payload, { abortEarly: false })

        expect(error.details[0]).toEqual(expect.objectContaining({
          message: 'Enter business name',
          path: ['businessName'],
          type: 'string.empty'
        }))
        expect(value).toEqual(payload)
      })
    })

    describe('because "businessName" is longer than 300 characters', () => {
      beforeEach(() => {
        payload.businessName = 'This sentence is intentionally written to be longer than 300 characters so that it can serve as an example of a string with precisely 304 characters, which is useful for testing, validation, or any other scenario where a specific character count is required. Its being used as the business name variable.'
      })

      test('it fails validation', () => {
        const { error, value } = schema.validate(payload, { abortEarly: false })

        expect(error.details[0]).toEqual(expect.objectContaining({
          message: 'Business name must be 300 characters or less',
          path: ['businessName'],
          type: 'string.max'
        }))
        expect(value).toEqual(payload)
      })
    })
  })
})
