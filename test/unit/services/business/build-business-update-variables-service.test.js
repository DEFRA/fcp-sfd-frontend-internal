// Test framework dependencies
import { describe, test, expect } from 'vitest'

// Thing under test
import { buildBusinessUpdateVariablesService } from '../../../../src/services/business/build-business-update-variables-service.js'

describe('buildBusinessUpdateVariablesService', () => {
  describe('when the email section needs updating', () => {
    test('builds the updateBusinessEmailInput variables', () => {
      const result = buildBusinessUpdateVariablesService({
        orderedSectionsToFix: ['email'],
        info: { sbi: '107183280' },
        changeBusinessEmail: { businessEmail: 'new@example.com' }
      })

      expect(result).toEqual({
        updateBusinessEmailInput: {
          sbi: '107183280',
          email: {
            address: 'new@example.com'
          }
        }
      })
    })
  })

  describe('when the email section is not in the sections to fix', () => {
    test('returns an empty variables object', () => {
      const result = buildBusinessUpdateVariablesService({
        orderedSectionsToFix: ['name'],
        info: { sbi: '107183280' },
        changeBusinessEmail: { businessEmail: 'new@example.com' }
      })

      expect(result).toEqual({})
    })
  })

  describe('when the email section is to fix but no email change exists', () => {
    test('returns an empty variables object', () => {
      const result = buildBusinessUpdateVariablesService({
        orderedSectionsToFix: ['email'],
        info: { sbi: '107183280' },
        changeBusinessEmail: undefined
      })

      expect(result).toEqual({})
    })
  })
})
