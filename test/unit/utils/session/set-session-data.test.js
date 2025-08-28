// Test framework dependencies
import { describe, test, expect, vi, beforeEach } from 'vitest'

// Thing under test
import { setSessionData } from '../../../../src/utils/session/set-session-data.js'

describe('setSessionData', () => {
  describe('when called with a data, key and a value', () => {
    let data
    let key
    let value
    let yar

    beforeEach(() => {
      vi.clearAllMocks()

      const sessionData = {
        businessAddress: {
          businessName: 'Diddly Squat Farm',
          businessAddress: {
            address1: '10 Skirbeck Way',
            city: 'Maidstone',
            postcode: 'SK22 1DL',
            country: 'United Kingdom'
          }
        }
      }

      // Mock yar session manager
      yar = {
        get: (key) => sessionData[key],
        set: (key, value) => { sessionData[key] = value }
      }

      data = {
        address1: 'Diddly Squat Farm',
        city: 'Chipping Norton',
        country: 'United Kingdom'
      }

      key = 'businessAddress'
      value = 'businessAddress'
    })

    test('it sets the payload on the yar session object using the value', () => {
      setSessionData(yar, key, value, data)

      const result = yar.get(key)

      expect(result).toEqual({
        businessName: 'Diddly Squat Farm',
        businessAddress: {
          address1: 'Diddly Squat Farm',
          city: 'Chipping Norton',
          country: 'United Kingdom'
        }
      })
    })

    test('returns the updated session object', () => {
      const result = setSessionData(yar, key, value, data)

      expect(result).toEqual({
        businessName: 'Diddly Squat Farm',
        businessAddress: {
          address1: 'Diddly Squat Farm',
          city: 'Chipping Norton',
          country: 'United Kingdom'
        }
      })
    })
  })
})
