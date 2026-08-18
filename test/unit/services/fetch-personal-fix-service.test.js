// Test framework dependencies
import { describe, test, expect, beforeEach, vi } from 'vitest'

// Things we need to mock
import { fetchPersonalDetailsService } from '../../../src/services/fetch-personal-details-service.js'

// Thing under test
import { fetchPersonalFixService } from '../../../src/services/fetch-personal-fix-service.js'

// Test helpers
import { getMappedData } from '../../mocks/mock-personal-details.js'

// Mocks
vi.mock('../../../src/services/fetch-personal-details-service.js', () => ({
  fetchPersonalDetailsService: vi.fn()
}))

describe('fetchPersonalFixService', () => {
  let crn
  let email
  let sessionData
  const personalDetails = getMappedData()

  beforeEach(() => {
    vi.clearAllMocks()

    crn = '987654321'
    email = 'test@example.com'
    sessionData = {
      source: 'address',
      orderedSectionsToFix: ['name', 'address']
    }

    fetchPersonalDetailsService.mockResolvedValue(personalDetails)
  })

  describe('when there are no personalFixUpdates in session', () => {
    test('it returns personal details with source and orderedSectionsToFix', async () => {
      const result = await fetchPersonalFixService(crn, email, sessionData)

      expect(fetchPersonalDetailsService).toHaveBeenCalledWith(crn, email)
      expect(result).toEqual({
        source: 'address',
        orderedSectionsToFix: ['name', 'address'],
        ...personalDetails
      })
    })

    test('it calls fetchPersonalDetailsService with correct parameters', async () => {
      await fetchPersonalFixService(crn, email, sessionData)

      expect(fetchPersonalDetailsService).toHaveBeenCalledTimes(1)
      expect(fetchPersonalDetailsService).toHaveBeenCalledWith(crn, email)
    })
  })

  describe('when session data is empty', () => {
    test('it returns personal details with undefined source and orderedSectionsToFix', async () => {
      const result = await fetchPersonalFixService(crn, email, {})

      expect(result).toEqual({
        source: undefined,
        orderedSectionsToFix: undefined,
        ...personalDetails
      })
    })
  })

  describe('when name fixes exist in session', () => {
    beforeEach(() => {
      sessionData.personalFixUpdates = {
        name: {
          first: 'John',
          middle: 'A',
          last: 'Doe'
        }
      }
    })

    test('it overlays the name fix onto personal details', async () => {
      const result = await fetchPersonalFixService(crn, email, sessionData)

      expect(result.changePersonalName).toEqual({
        first: 'John',
        middle: 'A',
        last: 'Doe'
      })
    })

    test('it preserves other personal details', async () => {
      const result = await fetchPersonalFixService(crn, email, sessionData)

      expect(result.contact).toEqual(personalDetails.contact)
      expect(result.address).toEqual(personalDetails.address)
    })
  })

  describe('when dob fixes exist in session', () => {
    beforeEach(() => {
      sessionData.personalFixUpdates = {
        dob: {
          day: '12',
          month: '06',
          year: '1995'
        }
      }
    })

    test('it overlays the dob fix onto personal details', async () => {
      const result = await fetchPersonalFixService(crn, email, sessionData)

      expect(result.changePersonalDob).toEqual({
        day: '12',
        month: '06',
        year: '1995'
      })
    })
  })

  describe('when email fixes exist in session', () => {
    beforeEach(() => {
      sessionData.personalFixUpdates = {
        email: {
          email: 'new@email.com'
        }
      }
    })

    test('it overlays the email fix onto personal details', async () => {
      const result = await fetchPersonalFixService(crn, email, sessionData)

      expect(result.changePersonalEmail).toEqual({
        email: 'new@email.com'
      })
    })
  })

  describe('when phone fixes exist in session', () => {
    beforeEach(() => {
      sessionData.personalFixUpdates = {
        phone: {
          telephone: '0123456789',
          mobile: '07123456789'
        }
      }
    })

    test('it overlays the phone fix onto personal details', async () => {
      const result = await fetchPersonalFixService(crn, email, sessionData)

      expect(result.changePersonalPhoneNumbers).toEqual({
        telephone: '0123456789',
        mobile: '07123456789'
      })
    })
  })

  describe('when address fixes exist in session', () => {
    beforeEach(() => {
      sessionData.personalFixUpdates = {
        address: {
          line1: '123 Main St',
          line2: 'Suite 100',
          postcode: 'A1 2BC',
          city: 'London'
        }
      }
    })

    test('it overlays the address fix onto personal details', async () => {
      const result = await fetchPersonalFixService(crn, email, sessionData)

      expect(result.changePersonalAddress).toEqual({
        line1: '123 Main St',
        line2: 'Suite 100',
        postcode: 'A1 2BC',
        city: 'London'
      })
    })
  })

  describe('when multiple fixes exist in session', () => {
    beforeEach(() => {
      sessionData.personalFixUpdates = {
        name: { first: 'Jane', last: 'Smith', middle: 'R' },
        email: { email: 'jane@smith.com' },
        phone: { mobile: '07987654321' }
      }
    })

    test('it overlays all fixes onto personal details', async () => {
      const result = await fetchPersonalFixService(crn, email, sessionData)

      expect(result).toMatchObject({
        source: 'address',
        orderedSectionsToFix: ['name', 'address'],
        changePersonalName: { first: 'Jane', last: 'Smith', middle: 'R' },
        changePersonalEmail: { email: 'jane@smith.com' },
        changePersonalPhoneNumbers: { mobile: '07987654321' }
      })
    })

    test('it does not add change fields for fixes that are not in personalFixUpdates', async () => {
      const result = await fetchPersonalFixService(crn, email, sessionData)

      expect(result.changePersonalDob).toBeUndefined()
      expect(result.changePersonalAddress).toBeUndefined()
    })
  })

  describe('when all fix types exist in session', () => {
    beforeEach(() => {
      sessionData.personalFixUpdates = {
        name: { first: 'Alice', last: 'Johnson' },
        dob: { day: '15', month: '03', year: '1992' },
        email: { email: 'alice@example.com' },
        phone: { telephone: '0201111111', mobile: '07911111111' },
        address: { line1: '456 Oak Ave', postcode: 'B2 3DE' }
      }
    })

    test('it overlays all fix types onto personal details', async () => {
      const result = await fetchPersonalFixService(crn, email, sessionData)

      expect(result.changePersonalName).toEqual({ first: 'Alice', last: 'Johnson' })
      expect(result.changePersonalDob).toEqual({ day: '15', month: '03', year: '1992' })
      expect(result.changePersonalEmail).toEqual({ email: 'alice@example.com' })
      expect(result.changePersonalPhoneNumbers).toEqual({ telephone: '0201111111', mobile: '07911111111' })
      expect(result.changePersonalAddress).toEqual({ line1: '456 Oak Ave', postcode: 'B2 3DE' })
    })
  })

  describe('when personalFixUpdates has empty values', () => {
    beforeEach(() => {
      sessionData.personalFixUpdates = {
        name: null,
        email: undefined,
        phone: {}
      }
    })

    test('it does not add change fields for empty or falsy values', async () => {
      const result = await fetchPersonalFixService(crn, email, sessionData)

      expect(result.changePersonalName).toBeUndefined()
      expect(result.changePersonalEmail).toBeUndefined()
      expect(result.changePersonalPhoneNumbers).toBeDefined()
    })
  })

  describe('when session data is not provided', () => {
    test('it uses empty object as default and returns personal details', async () => {
      const result = await fetchPersonalFixService(crn, email)

      expect(result).toEqual({
        source: undefined,
        orderedSectionsToFix: undefined,
        ...personalDetails
      })
    })
  })
})
