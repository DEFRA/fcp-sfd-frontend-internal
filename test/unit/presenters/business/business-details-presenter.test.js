// Test framework dependencies
import { describe, test, expect, beforeEach, vi } from 'vitest'
import { constants } from '@defra/fcp-sfd-frontend-engine'

// Thing under test
import { businessDetailsPresenter } from '../../../../src/presenters/business/business-details-presenter.js'

// Mock dependencies
import { config } from '../../../../src/config/index.js'

// Mock imports
vi.mock('../../../../src/config/index.js', () => ({
  config: {
    get: vi.fn()
  }
}))

const { LEGAL_STATUS } = constants.business

describe('businessDetailsPresenter', () => {
  let data
  let sbi

  beforeEach(() => {
    vi.clearAllMocks()

    // Default: interrupter OFF
    config.get.mockReturnValue(false)

    sbi = '106705779'

    data = {
      info: {
        sbi,
        businessName: 'Herberts Lawn Mowing',
        vat: 'GB123456789',
        traderNumber: '123456',
        vendorNumber: '654321',
        legalStatus: 'Sole Proprietorship',
        legalStatusCode: LEGAL_STATUS.soleProprietorship.code,
        registrationNumbers: { companiesHouse: null, charityCommission: null },
        type: 'Not Specified',
        countyParishHoldingNumbers: [{ cphNumber: '12/123/1234' }]
      },
      address: {
        lookup: { uprn: '123', buildingNumberRange: '7', street: 'Test St', city: 'London', county: 'Surrey' },
        manual: {},
        postcode: 'SW1A 1AA',
        country: 'United Kingdom'
      },
      contact: {
        email: 'test@example.com',
        landline: '01234567890',
        mobile: '07700900000'
      }
    }
  })

  test('returns correct pageTitle', () => {
    const result = businessDetailsPresenter(data, sbi)

    expect(result.pageTitle).toBe('View and update your business details')
  })

  test('returns the sbi', () => {
    const result = businessDetailsPresenter(data, sbi)

    expect(result.sbi).toBe(sbi)
  })

  describe('the "notification" property', () => {
    test('returns the flash notification when yar has one', () => {
      const yar = {
        flash: vi.fn().mockReturnValue([{ title: 'Success', text: 'You have updated your business email address' }])
      }

      const result = businessDetailsPresenter(data, sbi, yar)

      expect(yar.flash).toHaveBeenCalledWith('notification')
      expect(result.notification).toEqual({ title: 'Success', text: 'You have updated your business email address' })
    })

    test('returns undefined when yar has no flash notification', () => {
      const yar = { flash: vi.fn().mockReturnValue([]) }

      const result = businessDetailsPresenter(data, sbi, yar)

      expect(result.notification).toBeUndefined()
    })

    test('returns null when yar is not provided', () => {
      const result = businessDetailsPresenter(data, sbi)

      expect(result.notification).toBeNull()
    })
  })

  describe('the "breadcrumbs" property', () => {
    test('it should return the search results breadcrumb with the SBI as a query param', () => {
      const result = businessDetailsPresenter(data, sbi)

      expect(result.breadcrumbs[0]).toEqual({ text: 'Search results', href: `/search-sbi?sbi=${sbi}` })
    })

    test('it should return the business name and SBI as the final, clickable breadcrumb linking to the overview page', () => {
      const result = businessDetailsPresenter(data, sbi)

      expect(result.breadcrumbs[1]).toEqual({ text: `Herberts Lawn Mowing (SBI: ${sbi})`, href: `/business/${sbi}` })
    })

    describe('when the businessName property is missing', () => {
      test('it should fall back to just the SBI', () => {
        data.info.businessName = null
        const result = businessDetailsPresenter(data, sbi)

        expect(result.breadcrumbs[1]).toEqual({ text: `SBI: ${sbi}`, href: `/business/${sbi}` })
      })
    })

    describe('when sbi is missing', () => {
      test('it should link to the search page without a query param and omit the business breadcrumb', () => {
        const result = businessDetailsPresenter(data, null)

        expect(result.breadcrumbs).toEqual([
          { text: 'Search results', href: '/search-sbi' }
        ])
      })
    })
  })

  describe('businessName', () => {
    test('returns the business name value and "Change" action when populated', () => {
      const result = businessDetailsPresenter(data, sbi)

      expect(result.businessName.value).toBe('Herberts Lawn Mowing')
      expect(result.businessName.action).toBe('Change')
      expect(result.businessName.changeLink).toBe('/business/106705779/name-change')
    })

    test('returns "Not added" and "Add" action when business name is absent', () => {
      data.info.businessName = null
      const result = businessDetailsPresenter(data, sbi)

      expect(result.businessName.value).toBe('Not added')
      expect(result.businessName.action).toBe('Add')
    })
  })

  describe('businessAddress', () => {
    test('returns an array of address lines and "Change" action when address is present', () => {
      const result = businessDetailsPresenter(data, sbi)

      expect(Array.isArray(result.businessAddress.value)).toBe(true)
      expect(result.businessAddress.action).toBe('Change')
      expect(result.businessAddress.changeLink).toBe(`/business/${sbi}/address-change`)
    })

    test('returns "Not added" and "Add" action when address has no content', () => {
      data.address = { lookup: {}, manual: {}, postcode: null, country: null }
      const result = businessDetailsPresenter(data, sbi)

      expect(result.businessAddress.value).toBe('Not added')
      expect(result.businessAddress.action).toBe('Add')
    })
  })

  describe('businessTelephone', () => {
    test('returns telephone and mobile values and "Change" action when populated', () => {
      const result = businessDetailsPresenter(data, sbi)

      expect(result.businessTelephone.telephone).toBe('01234567890')
      expect(result.businessTelephone.mobile).toBe('07700900000')
      expect(result.businessTelephone.action).toBe('Change')
      expect(result.businessTelephone.changeLink).toBe('/business/106705779/phone-numbers-change')
    })

    test('returns "Not added" placeholders and "Add" action when both are absent', () => {
      data.contact.landline = null
      data.contact.mobile = null
      const result = businessDetailsPresenter(data, sbi)

      expect(result.businessTelephone.telephone).toBe('Not added')
      expect(result.businessTelephone.mobile).toBe('Not added')
      expect(result.businessTelephone.action).toBe('Add')
    })
  })

  describe('businessEmail', () => {
    test('returns email value and "Change" action when populated', () => {
      const result = businessDetailsPresenter(data, sbi)

      expect(result.businessEmail.value).toBe('test@example.com')
      expect(result.businessEmail.action).toBe('Change')
      expect(result.businessEmail.changeLink).toBe('/business/106705779/email-change')
    })

    test('returns "Not added" and "Add" action when email is absent', () => {
      data.contact.email = null
      const result = businessDetailsPresenter(data, sbi)

      expect(result.businessEmail.value).toBe('Not added')
      expect(result.businessEmail.action).toBe('Add')
    })
  })

  describe('vatNumber', () => {
    test('returns the VAT number value and "Change" action when populated', () => {
      const result = businessDetailsPresenter(data, sbi)

      expect(result.vatNumber.value).toBe('GB123456789')
      expect(result.vatNumber.action).toBe('Change')
      expect(result.vatNumber.changeLink).toEqual({
        items: [
          {
            href: `/business/${sbi}/vat-registration-number-change`,
            text: 'Change',
            visuallyHiddenText: 'VAT registration number',
            classes: 'govuk-link--no-visited-state'
          },
          {
            href: `/business/${sbi}/vat-registration-remove`,
            text: 'Remove',
            visuallyHiddenText: 'VAT registration number',
            classes: 'govuk-link--no-visited-state'
          }
        ]
      })
    })

    test('returns "No number added" and a single "Add" link when VAT is absent', () => {
      data.info.vat = null
      const result = businessDetailsPresenter(data, sbi)

      expect(result.vatNumber.value).toBe('No number added')
      expect(result.vatNumber.action).toBe('Add')
      expect(result.vatNumber.changeLink).toBe(`/business/${sbi}/vat-registration-number-change`)
    })
  })

  describe('reference numbers', () => {
    test('returns tradeNumber when present', () => {
      const result = businessDetailsPresenter(data, sbi)

      expect(result.tradeNumber).toBe('123456')
    })

    test('returns null tradeNumber when absent', () => {
      data.info.traderNumber = null
      const result = businessDetailsPresenter(data, sbi)

      expect(result.tradeNumber).toBeNull()
    })

    test('returns vendorRegistrationNumber when present', () => {
      const result = businessDetailsPresenter(data, sbi)

      expect(result.vendorRegistrationNumber).toBe('654321')
    })

    test('returns null vendorRegistrationNumber when absent', () => {
      data.info.vendorNumber = null
      const result = businessDetailsPresenter(data, sbi)

      expect(result.vendorRegistrationNumber).toBeNull()
    })
  })

  describe('countyParishHoldingNumbers', () => {
    test('returns an array of CPH number strings', () => {
      const result = businessDetailsPresenter(data, sbi)

      expect(result.countyParishHoldingNumbers).toEqual(['12/123/1234'])
    })

    test('uses singular text when there is one CPH number', () => {
      const result = businessDetailsPresenter(data, sbi)

      expect(result.countyParishHoldingNumbersText).toBe('County Parish Holding (CPH) number')
    })

    test('uses plural text when there are multiple CPH numbers', () => {
      data.info.countyParishHoldingNumbers = [{ cphNumber: '12/123/1234' }, { cphNumber: '12/123/5678' }]
      const result = businessDetailsPresenter(data, sbi)

      expect(result.countyParishHoldingNumbersText).toBe('County Parish Holding (CPH) numbers')
      expect(result.countyParishHoldingNumbers).toEqual(['12/123/1234', '12/123/5678'])
    })

    test('returns an empty array when CPH data is absent', () => {
      data.info.countyParishHoldingNumbers = []
      const result = businessDetailsPresenter(data, sbi)

      expect(result.countyParishHoldingNumbers).toEqual([])
    })
  })

  describe('businessLegalStatus', () => {
    test('returns the legal status value and "Change" action when populated', () => {
      const result = businessDetailsPresenter(data, sbi)

      expect(result.businessLegalStatus.value).toBe('Sole Proprietorship')
      expect(result.businessLegalStatus.action).toBe('Change')
      expect(result.businessLegalStatus.changeLink).toBe(`/business/${sbi}/legal-status-change`)
    })

    test('returns "Not added" and "Add" action when legal status is absent', () => {
      data.info.legalStatus = null
      const result = businessDetailsPresenter(data, sbi)

      expect(result.businessLegalStatus.value).toBe('Not added')
      expect(result.businessLegalStatus.action).toBe('Add')
    })
  })

  describe('businessType', () => {
    test('returns the business type value and "Change" action when populated', () => {
      const result = businessDetailsPresenter(data, sbi)

      expect(result.businessType.value).toBe('Not Specified')
      expect(result.businessType.action).toBe('Change')
      expect(result.businessType.changeLink).toBe('#')
    })

    test('returns "Not added" and "Add" action when business type is absent', () => {
      data.info.type = null
      const result = businessDetailsPresenter(data, sbi)

      expect(result.businessType.value).toBe('Not added')
      expect(result.businessType.action).toBe('Add')
    })
  })

  describe('legalStatusRegistrationNumber', () => {
    describe('when the legal status is a charity', () => {
      beforeEach(() => {
        data.info.legalStatusCode = LEGAL_STATUS.charitableIncorporatedOrganisation.code
        data.info.registrationNumbers = { companiesHouse: null, charityCommission: '12345678' }
      })

      test('returns the charity label and the charity commission number', () => {
        const result = businessDetailsPresenter(data, sbi)

        expect(result.legalStatusRegistrationNumber).toEqual({
          label: 'Charity commission registration number',
          value: '12345678',
          action: 'Change',
          changeLink: `/business/${sbi}/legal-status-enter`
        })
      })

      test('returns "Not added" and an "Add" action when the charity commission number is absent', () => {
        data.info.registrationNumbers.charityCommission = null
        const result = businessDetailsPresenter(data, sbi)

        expect(result.legalStatusRegistrationNumber.value).toBe('Not added')
        expect(result.legalStatusRegistrationNumber.action).toBe('Add')
        expect(result.legalStatusRegistrationNumber.changeLink).toBe(`/business/${sbi}/legal-status-enter`)
      })

      test('matches the legal status when the code is a number rather than a string', () => {
        data.info.legalStatusCode = Number(LEGAL_STATUS.charitableIncorporatedOrganisation.code)
        const result = businessDetailsPresenter(data, sbi)

        expect(result.legalStatusRegistrationNumber.label).toBe('Charity commission registration number')
      })
    })

    describe('when the legal status is a company', () => {
      beforeEach(() => {
        data.info.legalStatusCode = LEGAL_STATUS.privateLimitedCompany.code
        data.info.registrationNumbers = { companiesHouse: 'SC123456', charityCommission: null }
      })

      test('returns the company label and the companies house number', () => {
        const result = businessDetailsPresenter(data, sbi)

        expect(result.legalStatusRegistrationNumber).toEqual({
          label: 'Company registration number',
          value: 'SC123456',
          action: 'Change',
          changeLink: `/business/${sbi}/legal-status-enter`
        })
      })

      test('returns "Not added" and an "Add" action when the companies house number is absent', () => {
        data.info.registrationNumbers.companiesHouse = null
        const result = businessDetailsPresenter(data, sbi)

        expect(result.legalStatusRegistrationNumber.value).toBe('Not added')
        expect(result.legalStatusRegistrationNumber.action).toBe('Add')
        expect(result.legalStatusRegistrationNumber.changeLink).toBe(`/business/${sbi}/legal-status-enter`)
      })

      test('matches the legal status when the code is a number rather than a string', () => {
        data.info.legalStatusCode = Number(LEGAL_STATUS.privateLimitedCompany.code)
        const result = businessDetailsPresenter(data, sbi)

        expect(result.legalStatusRegistrationNumber.label).toBe('Company registration number')
      })
    })

    test('returns null when the legal status does not hold a registration number', () => {
      const result = businessDetailsPresenter(data, sbi)

      expect(result.legalStatusRegistrationNumber).toBeNull()
    })

    test('returns null when the legal status code is absent', () => {
      data.info.legalStatusCode = null
      const result = businessDetailsPresenter(data, sbi)

      expect(result.legalStatusRegistrationNumber).toBeNull()
    })

    test('returns "Not added" when the registration numbers are absent entirely', () => {
      data.info.legalStatusCode = LEGAL_STATUS.charitableIncorporatedOrganisation.code
      delete data.info.registrationNumbers
      const result = businessDetailsPresenter(data, sbi)

      expect(result.legalStatusRegistrationNumber.value).toBe('Not added')
    })
  })

  describe('the change link properties', () => {
    describe('when the business details interrupter is disabled', () => {
      test('all change links should point to their standard change link', () => {
        const result = businessDetailsPresenter(data, sbi, null, false, ['name', 'email'])

        expect(result.businessName.changeLink).toBe(`/business/${sbi}/name-change`)
        expect(result.businessAddress.changeLink).toBe(`/business/${sbi}/address-change`)
        expect(result.businessTelephone.changeLink).toBe(`/business/${sbi}/phone-numbers-change`)
        expect(result.businessEmail.changeLink).toBe(`/business/${sbi}/email-change`)
        expect(result.vatNumber.changeLink.items[0].href).toBe(`/business/${sbi}/vat-registration-number-change`)
        expect(result.vatNumber.changeLink.items[1].href).toBe(`/business/${sbi}/vat-registration-remove`)
      })
    })

    describe('when the business details interrupter is enabled', () => {
      beforeEach(() => {
        config.get.mockReturnValue(true)
      })

      describe('and all details are valid', () => {
        test('all change links should point to their standard change link', () => {
          const result = businessDetailsPresenter(data, sbi, null, true, [])

          expect(result.businessName.changeLink).toBe(`/business/${sbi}/name-change`)
          expect(result.businessAddress.changeLink).toBe(`/business/${sbi}/address-change`)
          expect(result.businessTelephone.changeLink).toBe(`/business/${sbi}/phone-numbers-change`)
          expect(result.businessEmail.changeLink).toBe(`/business/${sbi}/email-change`)
          expect(result.vatNumber.changeLink.items[0].href).toBe(`/business/${sbi}/vat-registration-number-change`)
        })
      })

      describe('and only the name is invalid', () => {
        test('all links except the name point to the interrupter journey', () => {
          const result = businessDetailsPresenter(data, sbi, null, false, ['name'])

          expect(result.businessName.changeLink).toBe(`/business/${sbi}/name-change`)
          expect(result.businessAddress.changeLink).toBe(`/business/${sbi}/details/fix?source=address`)
          expect(result.businessTelephone.changeLink).toBe(`/business/${sbi}/details/fix?source=phone`)
          expect(result.businessEmail.changeLink).toBe(`/business/${sbi}/details/fix?source=email`)
          expect(result.vatNumber.changeLink.items[0].href).toBe(`/business/${sbi}/details/fix?source=vat`)
        })
      })

      describe('and only the vat is invalid', () => {
        test('the vat keeps its standard change and remove links', () => {
          const result = businessDetailsPresenter(data, sbi, null, false, ['vat'])

          expect(result.vatNumber.changeLink.items[0].href).toBe(`/business/${sbi}/vat-registration-number-change`)
          expect(result.vatNumber.changeLink.items[1].href).toBe(`/business/${sbi}/vat-registration-remove`)
          expect(result.businessName.changeLink).toBe(`/business/${sbi}/details/fix?source=name`)
        })
      })

      describe('and only the address is invalid', () => {
        test('the address keeps its standard change link and other links point to the interrupter journey', () => {
          const result = businessDetailsPresenter(data, sbi, null, false, ['address'])

          expect(result.businessAddress.changeLink).toBe(`/business/${sbi}/address-change`)
          expect(result.businessName.changeLink).toBe(`/business/${sbi}/details/fix?source=name`)
        })
      })

      describe('and only the phone is invalid', () => {
        test('the phone keeps its standard change link and other links point to the interrupter journey', () => {
          const result = businessDetailsPresenter(data, sbi, null, false, ['phone'])

          expect(result.businessTelephone.changeLink).toBe(`/business/${sbi}/phone-numbers-change`)
          expect(result.businessName.changeLink).toBe(`/business/${sbi}/details/fix?source=name`)
        })
      })

      describe('and only the email is invalid', () => {
        test('the email keeps its standard change link and other links point to the interrupter journey', () => {
          const result = businessDetailsPresenter(data, sbi, null, false, ['email'])

          expect(result.businessEmail.changeLink).toBe(`/business/${sbi}/email-change`)
          expect(result.businessName.changeLink).toBe(`/business/${sbi}/details/fix?source=name`)
        })
      })

      describe('and multiple sections are invalid', () => {
        test('every link points to the interrupter journey', () => {
          const result = businessDetailsPresenter(data, sbi, null, false, ['name', 'email'])

          expect(result.businessName.changeLink).toBe(`/business/${sbi}/details/fix?source=name`)
          expect(result.businessAddress.changeLink).toBe(`/business/${sbi}/details/fix?source=address`)
          expect(result.businessTelephone.changeLink).toBe(`/business/${sbi}/details/fix?source=phone`)
          expect(result.businessEmail.changeLink).toBe(`/business/${sbi}/details/fix?source=email`)
        })

        test('both vat actions point to the interrupter journey', () => {
          const result = businessDetailsPresenter(data, sbi, null, false, ['name', 'email'])

          expect(result.vatNumber.changeLink.items[0].href).toBe(`/business/${sbi}/details/fix?source=vat`)
          expect(result.vatNumber.changeLink.items[1].href).toBe(`/business/${sbi}/details/fix?source=vat`)
        })

        test('the vat add link points to the interrupter journey when no vat number exists', () => {
          data.info.vat = null

          const result = businessDetailsPresenter(data, sbi, null, false, ['name', 'email'])

          expect(result.vatNumber.action).toBe('Add')
          expect(result.vatNumber.changeLink).toBe(`/business/${sbi}/details/fix?source=vat`)
        })
      })
    })
  })
})
