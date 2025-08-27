// Test framework dependencies
import { describe, test, expect, beforeEach } from 'vitest'

// Thing under test
import { formatValidationErrors } from '../../../src/utils/format-validation-errors.js'

describe('formatValidationErrors', () => {
  let errorDetails = []

  describe('when the error type is "object.missing"', () => {
    describe('and there are multiple peers (input fields)', () => {
      beforeEach(() => {
        errorDetails = [
          {
            type: 'object.missing',
            path: ['parentObject1'],
            message: 'Missing object fields',
            context: {
              peers: ['fieldA', 'fieldB']
            }
          },
          {
            type: 'object.missing',
            path: ['parentObject2'],
            message: 'Missing object fields',
            context: {
              peers: ['fieldC', 'fieldD']
            }
          }
        ]
      })

      test('it should format the errors correctly', () => {
        const result = formatValidationErrors(errorDetails)

        expect(result).toEqual({
          fieldA: { text: 'Missing object fields' },
          fieldB: { text: 'Missing object fields' },
          fieldC: { text: 'Missing object fields' },
          fieldD: { text: 'Missing object fields' }
        })
      })
    })

    describe('and there are no peers (only 1 input field is missing)', () => {
      beforeEach(() => {
        errorDetails = [
          {
            type: 'object.missing',
            path: ['parentObject'],
            message: 'Missing object fields'
          }
        ]
      })

      test('it should format the errors correctly', () => {
        const result = formatValidationErrors(errorDetails)

        expect(result).toEqual({
          parentObject: { text: 'Missing object fields' }
        })
      })
    })
  })

  describe('when the error is not "object.missing"', () => {
    beforeEach(() => {
      errorDetails = [
        {
          path: ['businessName'],
          message: 'Enter business name',
          type: 'string.empty'
        },
        {
          path: ['address1'],
          message: 'Enter address line 1',
          type: 'string.max'
        }
      ]
    })

    test('should format validation errors correctly', () => {
      const result = formatValidationErrors(errorDetails)

      expect(result).toEqual({
        businessName: { text: 'Enter business name' },
        address1: { text: 'Enter address line 1' }
      })
    })
  })

  describe('when there are no validation errors', () => {
    test('should return an empty object', () => {
      expect(formatValidationErrors([])).toEqual({})
    })
  })
})
