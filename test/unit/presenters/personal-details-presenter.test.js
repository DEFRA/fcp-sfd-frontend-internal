// Test framework dependencies
import { describe, test, expect, beforeEach, vi } from 'vitest'

// Thing under test
import { personalDetailsPresenter } from '../../../src/presenters/personal-details-presenter.js'

// Mock data
import { getMappedData } from '../../mocks/mock-personal-details.js'

// Mock dependencies
import { config } from '../../../src/config/index.js'

// Mock imports
vi.mock('../../../src/config/index.js', () => ({
  config: {
    get: vi.fn()
  }
}))

describe('personalDetailsPresenter', () => {
  let yar
  let data
  let hasValidPersonalDetails = true
  let sectionsNeedingUpdate = []

  beforeEach(() => {
    vi.clearAllMocks()

    // Default: interrupter OFF
    config.get.mockReturnValue(false)

    hasValidPersonalDetails = true
    sectionsNeedingUpdate = []

    data = getMappedData()

    // Mock yar session manager
    yar = {
      flash: vi.fn().mockReturnValue([{ title: 'Update', text: 'Personal details updated successfully' }])
    }
  })

  describe('when provided with personal details data', () => {
    test('it correctly presents the data', () => {
      const result = personalDetailsPresenter(data, yar, hasValidPersonalDetails, sectionsNeedingUpdate)
      expect(result).toEqual({
        breadcrumbs: [
          {
            text: 'Search results',
            href: '/search-crn'
          },
          {
            text: `${data.info.userName} (CRN: ${data.crn})`,
            href: `/customer/${data.crn}`
          }
        ],
        notification: { title: 'Update', text: 'Personal details updated successfully' },
        pageTitle: 'View and update your personal details',
        metaDescription: 'View and update your personal details.',
        userName: 'John Doe',
        crn: data.crn,
        personalAddress: {
          address: [
            'Acme Corp',
            'THE COACH HOUSE',
            'STOCKWELL HALL',
            '7 HAREWOOD AVENUE',
            'WOODTHORPE',
            'ELLICOMBE',
            'DARLINGTON',
            'Dorset',
            'CO9 3LS',
            'United Kingdom'
          ],
          action: 'Change',
          changeLink: '/account-address-change'
        },
        personalName: {
          fullName: 'John M Doe',
          action: 'Change',
          changeLink: '/account-name-change'
        },
        dob: {
          fullDateOfBirth: '1 January 1990',
          action: 'Change',
          changeLink: '/account-date-of-birth-change'
        },
        personalTelephone: {
          telephone: data.contact.telephone,
          mobile: 'Not added',
          action: 'Change',
          changeLink: '/account-phone-numbers-change'
        },
        personalEmail: {
          email: data.contact.email,
          action: 'Change',
          changeLink: '/account-email-change'
        }
      })
    })
  })

  describe('the "userName" property', () => {
    describe('when the userName property is missing', () => {
      test('it should return null', () => {
        data.info.userName = null
        const result = personalDetailsPresenter(data, yar, hasValidPersonalDetails, sectionsNeedingUpdate)

        expect(result.userName).toBeNull()
      })
    })
  })

  describe('the "breadcrumbs" property', () => {
    describe('when both userName and CRN exist', () => {
      test('it should return both breadcrumbs', () => {
        const result = personalDetailsPresenter(data, yar, hasValidPersonalDetails, sectionsNeedingUpdate)

        expect(result.breadcrumbs).toEqual([
          {
            text: 'Search results',
            href: '/search-crn'
          },
          {
            text: `${data.info.userName} (CRN: ${data.crn})`,
            href: `/customer/${data.crn}`
          }
        ])
      })
    })

    describe('when userName is missing', () => {
      test('it should return only the Search results breadcrumb', () => {
        data.info.userName = null
        const result = personalDetailsPresenter(data, yar, hasValidPersonalDetails, sectionsNeedingUpdate)

        expect(result.breadcrumbs).toEqual([
          {
            text: 'Search results',
            href: '/search-crn'
          }
        ])
      })
    })

    describe('when CRN is missing', () => {
      test('it should return only the Search results breadcrumb', () => {
        data.crn = null
        const result = personalDetailsPresenter(data, yar, hasValidPersonalDetails, sectionsNeedingUpdate)

        expect(result.breadcrumbs).toEqual([
          {
            text: 'Search results',
            href: '/search-crn'
          }
        ])
      })
    })

    describe('when both fullNameJoined and CRN are missing', () => {
      test('it should return only the Search results breadcrumb', () => {
        data.info.fullNameJoined = null
        data.crn = null
        const result = personalDetailsPresenter(data, yar, hasValidPersonalDetails, sectionsNeedingUpdate)

        expect(result.breadcrumbs).toEqual([
          {
            text: 'Search results',
            href: '/search-crn'
          }
        ])
      })
    })
  })

  describe('the "personalTelephone" property', () => {
    describe('when both telephone and mobile properties have values', () => {
      test('it should return the actual values', () => {
        data.contact.telephone = '01234567890'
        data.contact.mobile = '07123456789'
        const result = personalDetailsPresenter(data, yar, hasValidPersonalDetails, sectionsNeedingUpdate)

        expect(result.personalTelephone.telephone).toEqual('01234567890')
        expect(result.personalTelephone.mobile).toEqual('07123456789')
      })
    })

    describe('when the telephone property is missing', () => {
      test('returns "Not added" if telephone is missing', () => {
        data.contact.telephone = null
        const result = personalDetailsPresenter(data, yar, hasValidPersonalDetails, sectionsNeedingUpdate)

        expect(result.personalTelephone.telephone).toBe('Not added')
      })
    })
  })

  describe('the "personalMobile" property', () => {
    describe('when the mobile property is missing', () => {
      test('returns "Not added" if mobile is missing', () => {
        data.contact.mobile = null

        const result = personalDetailsPresenter(data, yar, hasValidPersonalDetails, sectionsNeedingUpdate)

        expect(result.personalTelephone.mobile).toBe('Not added')
      })
    })
  })

  describe('the "personalPhoneAction" property', () => {
    describe('when both telephone and mobile properties have values', () => {
      test('it should return the text "Change"', () => {
        data.contact.telephone = '01234567890'
        data.contact.mobile = '07123456789'
        const result = personalDetailsPresenter(data, yar, hasValidPersonalDetails, sectionsNeedingUpdate)

        expect(result.personalTelephone.action).toEqual('Change')
      })
    })

    describe('when only one of the properties has a value', () => {
      test('it should return the text "Change"', () => {
        data.contact.telephone = '01234567890'
        data.contact.mobile = null
        const result = personalDetailsPresenter(data, yar, hasValidPersonalDetails, sectionsNeedingUpdate)

        expect(result.personalTelephone.action).toEqual('Change')
      })
    })

    describe('when both properties are null', () => {
      test('it should return the text "Add"', () => {
        data.contact.telephone = null
        data.contact.mobile = null
        const result = personalDetailsPresenter(data, yar, hasValidPersonalDetails, sectionsNeedingUpdate)

        expect(result.personalTelephone.action).toEqual('Add')
      })
    })
  })

  describe('the "personalAddress.action" property', () => {
    describe('when the address property is missing', () => {
      test('it should return the text "Add"', () => {
        data.address.lookup.uprn = null
        data.address.manual.line1 = null

        const result = personalDetailsPresenter(data, yar, hasValidPersonalDetails, sectionsNeedingUpdate)

        expect(result.personalAddress.action).toEqual('Add')
      })
    })
  })

  describe('the "notification" property', () => {
    test('returns null if yar is falsy', () => {
      const result = personalDetailsPresenter(data, null, hasValidPersonalDetails, sectionsNeedingUpdate)

      expect(result.notification).toBe(null)
    })
  })

  describe('the "fullName" property', () => {
    test('returns a formatted full name', () => {
      const result = personalDetailsPresenter(data, yar, hasValidPersonalDetails, sectionsNeedingUpdate)

      expect(result.personalName.fullName).toBe('John M Doe')
    })
  })

  describe('the "personalEmail.email" property', () => {
    describe('when the email property is missing', () => {
      test('it should return the text "Not added"', () => {
        data.contact.email = null
        const result = personalDetailsPresenter(data, yar, hasValidPersonalDetails, sectionsNeedingUpdate)

        expect(result.personalEmail.email).toEqual('Not added')
      })
    })

    describe('when the email property has a value', () => {
      test('it should return the email address', () => {
        data.contact.email = 'test@test.com'
        const result = personalDetailsPresenter(data, yar, hasValidPersonalDetails, sectionsNeedingUpdate)

        expect(result.personalEmail.email).toEqual('test@test.com')
      })
    })
  })

  describe('the "personalEmail.action" property', () => {
    describe('when the personalEmail property is missing', () => {
      test('it should return the text "Add"', () => {
        data.contact.email = null
        const result = personalDetailsPresenter(data, yar, hasValidPersonalDetails, sectionsNeedingUpdate)

        expect(result.personalEmail.action).toEqual('Add')
      })
    })

    describe('when the personalEmail property has a value', () => {
      test('it should return the text "Change"', () => {
        data.contact.email = 'test@test.com'
        const result = personalDetailsPresenter(data, yar, hasValidPersonalDetails, sectionsNeedingUpdate)

        expect(result.personalEmail.action).toEqual('Change')
      })
    })
  })

  describe('the "dob.fullDateOfBirth" property', () => {
    describe('when dateOfBirth is missing', () => {
      test('it should return the text "Not added"', () => {
        delete data.info.dateOfBirth.full
        const result = personalDetailsPresenter(data, yar)

        expect(result.dob.fullDateOfBirth).toEqual('Not added')
      })
    })

    describe('when dateOfBirth is an invalid date', () => {
      test('it should return the text "Not added"', () => {
        data.info.dateOfBirth.full = '4000-14-01'
        const result = personalDetailsPresenter(data, yar)

        expect(result.dob.fullDateOfBirth).toEqual('Not added')
      })
    })

    describe('when dateOfBirth has a value', () => {
      test('it should return the formatted date', () => {
        data.info.dateOfBirth.full = '2000-01-01'
        const result = personalDetailsPresenter(data, yar)

        expect(result.dob.fullDateOfBirth).toEqual('1 January 2000')
      })
    })
  })

  describe('the "dob.action" property', () => {
    describe('when dateOfBirth is missing', () => {
      test('it should return the text "Add"', () => {
        delete data.info.dateOfBirth.full
        const result = personalDetailsPresenter(data, yar)

        expect(result.dob.action).toEqual('Add')
      })
    })

    describe('when dateOfBirth is an invalid date', () => {
      test('it should return the text "Add"', () => {
        data.info.dateOfBirth.full = '4000-14-01'
        const result = personalDetailsPresenter(data, yar)

        expect(result.dob.action).toEqual('Add')
      })
    })

    describe('when dateOfBirth has a value', () => {
      test('it should return the text "Change"', () => {
        data.info.dateOfBirth.full = '2000-01-01'
        const result = personalDetailsPresenter(data, yar)

        expect(result.dob.action).toEqual('Change')
      })
    })

    describe('when dateOfBirth is in the future', () => {
      test('it should return the text "Add"', () => {
        // Set a future date (1 year from now)
        const futureDate = new Date()
        futureDate.setFullYear(futureDate.getFullYear() + 1)
        const yyyy = futureDate.getFullYear()
        const mm = String(futureDate.getMonth() + 1).padStart(2, '0')
        const dd = String(futureDate.getDate()).padStart(2, '0')
        data.info.dateOfBirth.full = `${yyyy}-${mm}-${dd}`
        const result = personalDetailsPresenter(data, yar)
        expect(result.dob.action).toEqual('Add')
      })
    })
  })

  describe('the change link properties', () => {
    describe('when the personal details interrupter is disabled', () => {
      test('all change links should point to their standard change link', () => {
        const result = personalDetailsPresenter(data, yar, hasValidPersonalDetails, sectionsNeedingUpdate)

        expect(result.personalName.changeLink).toBe('/account-name-change')
        expect(result.personalAddress.changeLink).toBe('/account-address-change')
        expect(result.personalTelephone.changeLink).toBe('/account-phone-numbers-change')
        expect(result.personalEmail.changeLink).toBe('/account-email-change')
        expect(result.dob.changeLink).toBe('/account-date-of-birth-change')
      })
    })

    describe('when the personal details interrupter is enabled', () => {
      beforeEach(() => {
        // Enable the personal details interrupter feature toggle
        config.get.mockReturnValue(true)
      })

      describe('and all details are valid', () => {
        test('all change links should point to their standard change link', () => {
          const result = personalDetailsPresenter(data, yar, hasValidPersonalDetails, sectionsNeedingUpdate)

          expect(result.personalName.changeLink).toBe('/account-name-change')
          expect(result.personalAddress.changeLink).toBe('/account-address-change')
          expect(result.personalTelephone.changeLink).toBe('/account-phone-numbers-change')
          expect(result.personalEmail.changeLink).toBe('/account-email-change')
          expect(result.dob.changeLink).toBe('/account-date-of-birth-change')
        })
      })

      describe('and only one name is invalid', () => {
        beforeEach(() => {
          hasValidPersonalDetails = false
          sectionsNeedingUpdate = ['name']
        })

        test('all links except the name points to the interrupter journey', () => {
          const result = personalDetailsPresenter(data, yar, hasValidPersonalDetails, sectionsNeedingUpdate)

          expect(result.personalName.changeLink).toBe('/account-name-change')
          expect(result.personalAddress.changeLink).toBe('/personal-fix?source=address')
          expect(result.personalTelephone.changeLink).toBe('/personal-fix?source=phone')
          expect(result.personalEmail.changeLink).toBe('/personal-fix?source=email')
          expect(result.dob.changeLink).toBe('/personal-fix?source=dob')
        })
      })

      describe('and only address is invalid', () => {
        beforeEach(() => {
          hasValidPersonalDetails = false
          sectionsNeedingUpdate = ['address']
        })

        test('all links except the address points to the interrupter journey', () => {
          const result = personalDetailsPresenter(data, yar, hasValidPersonalDetails, sectionsNeedingUpdate)

          expect(result.personalName.changeLink).toBe('/personal-fix?source=name')
          expect(result.personalAddress.changeLink).toBe('/account-address-change')
          expect(result.personalTelephone.changeLink).toBe('/personal-fix?source=phone')
          expect(result.personalEmail.changeLink).toBe('/personal-fix?source=email')
          expect(result.dob.changeLink).toBe('/personal-fix?source=dob')
        })
      })

      describe('and only phone number is invalid', () => {
        beforeEach(() => {
          hasValidPersonalDetails = false
          sectionsNeedingUpdate = ['phone']
        })

        test('all links except the phone number points to the interrupter journey', () => {
          const result = personalDetailsPresenter(data, yar, hasValidPersonalDetails, sectionsNeedingUpdate)

          expect(result.personalName.changeLink).toBe('/personal-fix?source=name')
          expect(result.personalAddress.changeLink).toBe('/personal-fix?source=address')
          expect(result.personalTelephone.changeLink).toBe('/account-phone-numbers-change')
          expect(result.personalEmail.changeLink).toBe('/personal-fix?source=email')
          expect(result.dob.changeLink).toBe('/personal-fix?source=dob')
        })
      })

      describe('and only email is invalid', () => {
        beforeEach(() => {
          hasValidPersonalDetails = false
          sectionsNeedingUpdate = ['email']
        })

        test('all links except the email points to the interrupter journey', () => {
          const result = personalDetailsPresenter(data, yar, hasValidPersonalDetails, sectionsNeedingUpdate)

          expect(result.personalName.changeLink).toBe('/personal-fix?source=name')
          expect(result.personalAddress.changeLink).toBe('/personal-fix?source=address')
          expect(result.personalTelephone.changeLink).toBe('/personal-fix?source=phone')
          expect(result.personalEmail.changeLink).toBe('/account-email-change')
          expect(result.dob.changeLink).toBe('/personal-fix?source=dob')
        })
      })

      describe('and only dob is invalid', () => {
        beforeEach(() => {
          hasValidPersonalDetails = false
          sectionsNeedingUpdate = ['dob']
        })

        test('all links except the dob points to the interrupter journey', () => {
          const result = personalDetailsPresenter(data, yar, hasValidPersonalDetails, sectionsNeedingUpdate)

          expect(result.personalName.changeLink).toBe('/personal-fix?source=name')
          expect(result.personalAddress.changeLink).toBe('/personal-fix?source=address')
          expect(result.personalTelephone.changeLink).toBe('/personal-fix?source=phone')
          expect(result.personalEmail.changeLink).toBe('/personal-fix?source=email')
          expect(result.dob.changeLink).toBe('/account-date-of-birth-change')
        })
      })

      describe('when multiple details are invalid', () => {
        beforeEach(() => {
          hasValidPersonalDetails = false
          sectionsNeedingUpdate = ['name', 'address', 'phone', 'email', 'dob']
        })

        test('all links point to the interrupter journey', () => {
          const result = personalDetailsPresenter(data, yar, hasValidPersonalDetails, sectionsNeedingUpdate)

          expect(result.personalName.changeLink).toBe('/personal-fix?source=name')
          expect(result.personalAddress.changeLink).toBe('/personal-fix?source=address')
          expect(result.personalTelephone.changeLink).toBe('/personal-fix?source=phone')
          expect(result.personalEmail.changeLink).toBe('/personal-fix?source=email')
          expect(result.dob.changeLink).toBe('/personal-fix?source=dob')
        })
      })
    })
  })
})
