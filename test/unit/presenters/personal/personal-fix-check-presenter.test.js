// Test framework dependencies
import { describe, test, expect, beforeEach } from 'vitest'

// Thing under test
import { personalFixCheckPresenter } from '../../../../src/presenters/personal/personal-fix-check-presenter.js'

describe('personalFixCheckPresenter', () => {
  const crn = '123456'
  let data

  beforeEach(() => {
    data = {
      orderedSectionsToFix: ['name', 'dob', 'address', 'phone', 'email'],
      changePersonalName: {
        first: 'Alfred',
        middle: 'J',
        last: 'Waldron'
      },
      changePersonalDob: {
        day: '5',
        month: '7',
        year: '1982'
      },
      changePersonalEmail: {
        personalEmail: 'alfred@example.com'
      },
      changePersonalAddress: {
        address1: '1 Test Street',
        address2: 'Test Area',
        address3: '',
        city: 'Testville',
        county: '',
        postcode: 'TE1 1ST',
        country: 'UK'
      },
      changePersonalPhoneNumbers: {
        personalTelephone: '0123456789',
        personalMobile: '07123456789'
      }
    }
  })

  describe('when provided with personal fix data', () => {
    test('it correctly presents the data', () => {
      const result = personalFixCheckPresenter(data, crn)

      expect(result).toEqual({
        backLink: `/customer/${crn}/details/fix-list`,
        pageTitle: 'Check your details are correct before submitting',
        metaDescription: 'Check your details are correct before submitting',
        userName: null,
        crn,
        changeLink: `/customer/${crn}/details/fix-list`,
        sections: ['name', 'dob', 'address', 'phone', 'email'],
        fullName: 'Alfred J Waldron',
        dateOfBirth: '5 July 1982',
        personalEmail: 'alfred@example.com',
        address: [
          '1 Test Street',
          'Test Area',
          'Testville',
          'TE1 1ST',
          'UK'
        ],
        personalTelephone: {
          telephone: '0123456789',
          mobile: '07123456789'
        }
      })
    })
  })

  describe('the "fullName" property', () => {
    describe('when changePersonalName is missing', () => {
      beforeEach(() => {
        delete data.changePersonalName
      })

      test('it should return null', () => {
        const result = personalFixCheckPresenter(data, crn)

        expect(result.fullName).toBeNull()
      })
    })

    describe('when middle name is missing', () => {
      beforeEach(() => {
        data.changePersonalName = {
          first: 'John',
          last: 'Smith'
        }
      })

      test('it should exclude empty values from the formatted name', () => {
        const result = personalFixCheckPresenter(data, crn)

        expect(result.fullName).toEqual('John Smith')
      })
    })
  })

  describe('the "dateOfBirth" property', () => {
    describe('when changePersonalDob is missing', () => {
      beforeEach(() => {
        delete data.changePersonalDob
      })

      test('it should return null', () => {
        const result = personalFixCheckPresenter(data, crn)

        expect(result.dateOfBirth).toBeNull()
      })
    })

    describe('when day or month are single digits', () => {
      beforeEach(() => {
        data.changePersonalDob = { day: '5', month: '7', year: '1982' }
      })

      test('it pads single digits with leading zeros', () => {
        const result = personalFixCheckPresenter(data, crn)

        expect(result.dateOfBirth).toEqual('5 July 1982')
      })
    })
  })

  describe('the "personalEmail" property', () => {
    describe('when changePersonalEmail is missing', () => {
      beforeEach(() => {
        delete data.changePersonalEmail
      })

      test('it should return null', () => {
        const result = personalFixCheckPresenter(data, crn)

        expect(result.personalEmail).toBeNull()
      })
    })

    describe('when personalEmail is missing from changePersonalEmail', () => {
      beforeEach(() => {
        data.changePersonalEmail = {}
      })

      test('it should return null', () => {
        const result = personalFixCheckPresenter(data, crn)

        expect(result.personalEmail).toBeNull()
      })
    })
  })

  describe('the "address" property', () => {
    describe('when changePersonalAddress is missing', () => {
      beforeEach(() => {
        delete data.changePersonalAddress
      })

      test('it should return null', () => {
        const result = personalFixCheckPresenter(data, crn)

        expect(result.address).toBeNull()
      })
    })

    test('it filters out empty address values', () => {
      const result = personalFixCheckPresenter(data, crn)

      expect(result.address).not.toContain('')
    })

    describe('when all address fields are populated', () => {
      test('it returns all non-empty address fields in order', () => {
        const result = personalFixCheckPresenter(data, crn)

        expect(result.address).toEqual([
          '1 Test Street',
          'Test Area',
          'Testville',
          'TE1 1ST',
          'UK'
        ])
      })
    })

    describe('when only some address fields are populated', () => {
      beforeEach(() => {
        data.changePersonalAddress = {
          address1: '5 High Street',
          address2: '',
          address3: '',
          city: 'London',
          county: '',
          postcode: 'SW1 1AA',
          country: ''
        }
      })

      test('it returns only the non-empty fields', () => {
        const result = personalFixCheckPresenter(data, crn)

        expect(result.address).toEqual([
          '5 High Street',
          'London',
          'SW1 1AA'
        ])
      })
    })
  })

  describe('the "personalTelephone" property', () => {
    describe('when changePersonalPhoneNumbers is missing', () => {
      beforeEach(() => {
        delete data.changePersonalPhoneNumbers
      })

      test('it should return null values for both numbers', () => {
        const result = personalFixCheckPresenter(data, crn)

        expect(result.personalTelephone).toEqual({
          telephone: null,
          mobile: null
        })
      })
    })

    describe('when only telephone is provided', () => {
      beforeEach(() => {
        data.changePersonalPhoneNumbers = {
          personalTelephone: '0123456789'
        }
      })

      test('it should return the telephone and null for mobile', () => {
        const result = personalFixCheckPresenter(data, crn)

        expect(result.personalTelephone).toEqual({
          telephone: '0123456789',
          mobile: null
        })
      })
    })

    describe('when only mobile is provided', () => {
      beforeEach(() => {
        data.changePersonalPhoneNumbers = {
          personalMobile: '07123456789'
        }
      })

      test('it should return null for telephone and the mobile', () => {
        const result = personalFixCheckPresenter(data, crn)

        expect(result.personalTelephone).toEqual({
          telephone: null,
          mobile: '07123456789'
        })
      })
    })
  })

  describe('the "sections" property', () => {
    test('it returns the orderedSectionsToFix array', () => {
      const result = personalFixCheckPresenter(data, crn)

      expect(result.sections).toEqual(['name', 'dob', 'address', 'phone', 'email'])
    })
  })

  describe('the "backLink" property', () => {
    test('it includes the crn in the URL', () => {
      const result = personalFixCheckPresenter(data, crn)

      expect(result.backLink).toEqual(`/customer/${crn}/details/fix-list`)
    })

    test('it falls back to the search page when the crn is missing', () => {
      const result = personalFixCheckPresenter(data, undefined)

      expect(result.backLink).toEqual('/search-crn')
    })
  })

  describe('the "changeLink" property', () => {
    test('it includes the crn in the URL', () => {
      const result = personalFixCheckPresenter(data, crn)

      expect(result.changeLink).toEqual(`/customer/${crn}/details/fix-list`)
    })
  })
})
