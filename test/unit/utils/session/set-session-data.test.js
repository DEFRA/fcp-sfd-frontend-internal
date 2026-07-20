// Test framework dependencies
import { describe, test, expect, vi, beforeEach } from 'vitest'

// Thing under test
import { setSessionData } from '../../../../src/utils/session/set-session-data.js'

describe('setSessionData', () => {
  let data
  let key
  let value
  let yar
  let sessionData

  beforeEach(() => {
    vi.clearAllMocks()

    sessionData = {
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

  describe('when called with existing session data', () => {
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

  describe('when no session data exists yet', () => {
    beforeEach(() => {
      sessionData = {} // clear everything
    })

    test('it creates the object and sets the value', () => {
      const result = setSessionData(yar, key, value, data)

      expect(result).toEqual({
        businessAddress: {
          address1: 'Diddly Squat Farm',
          city: 'Chipping Norton',
          country: 'United Kingdom'
        }
      })
    })
  })
})
