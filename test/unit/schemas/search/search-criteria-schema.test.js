// Test framework dependencies
import { describe, test, expect, beforeEach } from 'vitest'

// Thing under test
import { searchCriteriaSchema } from '../../../../src/schemas/search/search-criteria-schema.js'

describe('search criteria schema', () => {
  let payload
  let schema

  beforeEach(() => {
    schema = searchCriteriaSchema

    payload = { searchCriteria: 'sbi' }
  })

  describe('when valid data is provided', () => {
    test('it confirms "sbi" is valid', () => {
      const { error, value } = schema.validate(payload, { abortEarly: false })

      expect(error).toBeUndefined()
      expect(value).toEqual(payload)
    })

    test('it confirms "crn" is valid', () => {
      payload.searchCriteria = 'crn'

      const { error, value } = schema.validate(payload, { abortEarly: false })

      expect(error).toBeUndefined()
      expect(value).toEqual(payload)
    })
  })

  describe('when invalid data is provided', () => {
    describe('because "searchCriteria" is missing', () => {
      beforeEach(() => {
        delete payload.searchCriteria
      })

      test('it fails validation', () => {
        const { error } = schema.validate(payload, { abortEarly: false })

        expect(error.details[0]).toEqual(expect.objectContaining({
          message: 'Select what you want to search by',
          path: ['searchCriteria'],
          type: 'any.required'
        }))
      })
    })

    describe('because "searchCriteria" is empty', () => {
      beforeEach(() => {
        payload.searchCriteria = ''
      })

      test('it fails validation', () => {
        const { error } = schema.validate(payload, { abortEarly: false })

        expect(error.details[0]).toEqual(expect.objectContaining({
          message: 'Select what you want to search by',
          path: ['searchCriteria'],
          type: 'any.only'
        }))
      })
    })

    describe('because "searchCriteria" is not a valid option', () => {
      beforeEach(() => {
        payload.searchCriteria = 'invalid'
      })

      test('it fails validation', () => {
        const { error } = schema.validate(payload, { abortEarly: false })

        expect(error.details[0]).toEqual(expect.objectContaining({
          message: 'Select what you want to search by',
          path: ['searchCriteria'],
          type: 'any.only'
        }))
      })
    })
  })
})
