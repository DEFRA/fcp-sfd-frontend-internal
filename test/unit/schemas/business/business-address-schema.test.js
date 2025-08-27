// Test framework dependencies
import { describe, test, expect, beforeEach } from 'vitest'

// Thing under test
import { businessAddressSchema } from '../../../../src/schemas/business/business-address-schema.js'

describe('business address schema', () => {
  let payload
  let schema

  beforeEach(() => {
    schema = businessAddressSchema

    payload = {
      address1: '10 Skirbeck Way',
      address2: 'Lonely Lane',
      city: 'Maidstone',
      county: 'Somerset',
      postcode: 'SK22 1DL',
      country: 'United Kingdom'
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
    describe('because "address1" is missing', () => {
      beforeEach(() => {
        delete payload.address1
      })

      test('it fails validation', () => {
        const { error, value } = schema.validate(payload, { abortEarly: false })

        expect(error.details[0]).toEqual(expect.objectContaining({
          message: 'Enter address line 1, typically the building and street',
          path: ['address1'],
          type: 'any.required'
        }))
        expect(value).toEqual(payload)
      })
    })

    describe('because "address1" is longer than 100 characters', () => {
      beforeEach(() => {
        payload.address1 = 'The quick brown fox jumps over the lazy dog while wondering if it forgot to bring its umbrella today.'
      })

      test('it fails validation', () => {
        const { error, value } = schema.validate(payload, { abortEarly: false })

        expect(error.details[0]).toEqual(expect.objectContaining({
          message: 'Address line 1 must be 100 characters or less',
          path: ['address1'],
          type: 'string.max'
        }))
        expect(value).toEqual(payload)
      })
    })

    describe('because "address2" is longer than 100 characters', () => {
      beforeEach(() => {
        payload.address2 = 'The quick brown fox jumps over the lazy dog while wondering if it forgot to bring its umbrella today.'
      })

      test('it fails validation', () => {
        const { error, value } = schema.validate(payload, { abortEarly: false })

        expect(error.details[0]).toEqual(expect.objectContaining({
          message: 'Address line 2 must be 100 characters or less',
          path: ['address2'],
          type: 'string.max'
        }))
        expect(value).toEqual(payload)
      })
    })

    describe('because "city" is missing', () => {
      beforeEach(() => {
        delete payload.city
      })

      test('it fails validation', () => {
        const { error, value } = schema.validate(payload, { abortEarly: false })

        expect(error.details[0]).toEqual(expect.objectContaining({
          message: 'Enter town or city',
          path: ['city'],
          type: 'any.required'
        }))
        expect(value).toEqual(payload)
      })
    })

    describe('because "city" is longer than 100 characters', () => {
      beforeEach(() => {
        payload.city = 'The quick brown fox jumps over the lazy dog while wondering if it forgot to bring its umbrella today.'
      })

      test('it fails validation', () => {
        const { error, value } = schema.validate(payload, { abortEarly: false })

        expect(error.details[0]).toEqual(expect.objectContaining({
          message: 'Town or city must be 100 characters or less',
          path: ['city'],
          type: 'string.max'
        }))
        expect(value).toEqual(payload)
      })
    })

    describe('because "county" is longer than 100 characters', () => {
      beforeEach(() => {
        payload.county = 'The quick brown fox jumps over the lazy dog while wondering if it forgot to bring its umbrella today.'
      })

      test('it fails validation', () => {
        const { error, value } = schema.validate(payload, { abortEarly: false })

        expect(error.details[0]).toEqual(expect.objectContaining({
          message: 'County must be 100 characters or less',
          path: ['county'],
          type: 'string.max'
        }))
        expect(value).toEqual(payload)
      })
    })

    describe('because "postcode" is longer than 10 characters', () => {
      beforeEach(() => {
        payload.postcode = 'More than 10 characters'
      })

      test('it fails validation', () => {
        const { error, value } = schema.validate(payload, { abortEarly: false })

        expect(error.details[0]).toEqual(expect.objectContaining({
          message: 'Postal code or zip code must be 10 characters or less',
          path: ['postcode'],
          type: 'string.max'
        }))
        expect(value).toEqual(payload)
      })
    })

    describe('because "country" is missing', () => {
      beforeEach(() => {
        delete payload.country
      })

      test('it fails validation', () => {
        const { error, value } = schema.validate(payload, { abortEarly: false })

        expect(error.details[0]).toEqual(expect.objectContaining({
          message: 'Enter a country',
          path: ['country'],
          type: 'any.required'
        }))
        expect(value).toEqual(payload)
      })
    })

    describe('because "country" is longer than 60 characters', () => {
      beforeEach(() => {
        payload.country = 'This is definitely much more than fifty-nine but not by much..'
      })

      test('it fails validation', () => {
        const { error, value } = schema.validate(payload, { abortEarly: false })

        expect(error.details[0]).toEqual(expect.objectContaining({
          message: 'Country must be 60 characters or less',
          path: ['country'],
          type: 'string.max'
        }))
        expect(value).toEqual(payload)
      })
    })
  })
})
