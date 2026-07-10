// Test framework dependencies
import { describe, test, expect, beforeEach } from 'vitest'

// Test helpers
import { getDalData, getMappedData } from '../../mocks/mock-personal-details.js'

// Thing under test
const { mapPersonalDetails } = await import('../../../src/mappers/personal-details-mapper.js')

// Helper to test synchronous error throwing
function expectToThrow (fn) {
  try {
    fn()
    throw new Error('Expected function to throw but it did not')
  } catch (err) {
    return err
  }
}

describe('personalDetailsMapper', () => {
  let dalData

  beforeEach(() => {
    dalData = getDalData()
  })

  describe('when given null or undefined input', () => {
    test('it should throw when value is null', () => {
      const error = expectToThrow(() => mapPersonalDetails(null))

      expect(error.message).toEqual('Personal details value cannot be null or undefined')
    })

    test('it should throw when value is undefined', () => {
      const error = expectToThrow(() => mapPersonalDetails(undefined))

      expect(error.message).toEqual('Personal details value cannot be null or undefined')
    })

    test('it should throw when customer object is missing', () => {
      const error = expectToThrow(() => mapPersonalDetails({}))

      expect(error.message).toEqual('Personal details value must contain a customer object')
    })

    test('it should throw when customer info is missing', () => {
      const error = expectToThrow(() => mapPersonalDetails({ customer: {} }))

      expect(error.message).toEqual('Customer must contain an info object')
    })
  })

  describe('when given valid raw DAL data', () => {
    describe('full mapping', () => {
      test('it should map the values to the correct format', () => {
        const result = mapPersonalDetails(dalData)

        expect(result).toEqual(getMappedData())
      })
    })

    describe('info.userName', () => {
      beforeEach(() => {
        dalData.customer.info.name = {
          first: 'Software',
          last: 'Developer',
          middle: null
        }
      })

      test('it should build the userName correctly', () => {
        const result = mapPersonalDetails(dalData)

        expect(result.info.userName).toEqual('Software Developer')
      })
    })

    describe('info.fullName', () => {
      beforeEach(() => {
        dalData.customer.info.name = {
          first: 'Software',
          last: 'Developer',
          middle: 'Engineer'
        }
      })

      test('it should build the fullName object correctly', () => {
        const result = mapPersonalDetails(dalData)

        expect(result.info.fullName).toEqual({
          first: 'Software',
          last: 'Developer',
          middle: 'Engineer'
        })
      })
    })

    describe('info.fullNameJoined', () => {
      beforeEach(() => {
        dalData.customer.info.name = {
          first: 'Software',
          last: 'Developer',
          middle: 'Engineer'
        }
      })

      test('it should build the fullNameJoined string correctly', () => {
        const result = mapPersonalDetails(dalData)

        expect(result.info.fullNameJoined).toEqual('Software Engineer Developer')
      })

      test('it should filter out null or undefined middle names', () => {
        dalData.customer.info.name.middle = null
        const result = mapPersonalDetails(dalData)

        expect(result.info.fullNameJoined).toEqual('Software Developer')
      })
    })

    describe('info.dateOfBirth', () => {
      describe('when date of birth exists', () => {
        beforeEach(() => {
          dalData.customer.info.dateOfBirth = '1990-01-01'
        })

        test('it should build the date of birth correctly when it exists', () => {
          const result = mapPersonalDetails(dalData)

          expect(result.info.dateOfBirth).toEqual({
            full: '1990-01-01',
            day: '01',
            month: '01',
            year: '1990'
          })
        })
      })

      describe('when date of birth does not exist', () => {
        beforeEach(() => {
          dalData.customer.info.dateOfBirth = null
        })

        test('it should build the date of birth correctly when it does not exist', () => {
          const result = mapPersonalDetails(dalData)

          expect(result.info.dateOfBirth).toEqual({
            full: null,
            day: null,
            month: null,
            year: null
          })
        })
      })
    })

    describe('handling missing nested objects', () => {
      test('it should handle missing name object gracefully', () => {
        dalData.customer.info.name = null
        const result = mapPersonalDetails(dalData)

        expect(result.info.userName).toBeNull()
        expect(result.info.fullName).toEqual({
          first: null,
          last: null,
          middle: null
        })
        expect(result.info.fullNameJoined).toEqual('')
      })

      test('it should handle missing address object gracefully', () => {
        dalData.customer.info.address = null
        expect(() => mapPersonalDetails(dalData)).not.toThrow()
      })

      test('it should handle missing email object gracefully', () => {
        dalData.customer.info.email = null
        const result = mapPersonalDetails(dalData)

        expect(result.contact.email).toBeNull()
      })

      test('it should handle missing phone object gracefully', () => {
        dalData.customer.info.phone = null
        const result = mapPersonalDetails(dalData)

        expect(result.contact.telephone).toBeNull()
        expect(result.contact.mobile).toBeNull()
      })
    })

    describe('crn', () => {
      test('it should map the crn correctly', () => {
        const result = mapPersonalDetails(dalData)

        expect(result.crn).toEqual('123456890')
      })
    })

    describe('address', () => {
      test('it should map the address correctly', () => {
        const result = mapPersonalDetails(dalData)

        expect(result.address).toBeDefined()
        expect(result.address.lookup).toBeDefined()
        expect(result.address.manual).toBeDefined()
        expect(result.address.postcode).toEqual('CO9 3LS')
        expect(result.address.country).toEqual('United Kingdom')
        expect(result.address.city).toEqual('DARLINGTON')
      })
    })

    describe('contact', () => {
      test('it should map the email correctly', () => {
        const result = mapPersonalDetails(dalData)

        expect(result.contact.email).toEqual('test@example.com')
      })

      test('it should map the telephone correctly', () => {
        const result = mapPersonalDetails(dalData)

        expect(result.contact.telephone).toEqual('01234567890')
      })

      test('it should map the mobile as null when not provided', () => {
        const result = mapPersonalDetails(dalData)

        expect(result.contact.mobile).toBeNull()
      })

      test('it should map the mobile when provided', () => {
        dalData.customer.info.phone.mobile = '07700900123'
        const result = mapPersonalDetails(dalData)

        expect(result.contact.mobile).toEqual('07700900123')
      })

      test('it should map telephone as null when not provided', () => {
        dalData.customer.info.phone.landline = null
        const result = mapPersonalDetails(dalData)

        expect(result.contact.telephone).toBeNull()
      })
    })
  })
})
