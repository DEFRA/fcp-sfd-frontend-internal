// Test framework dependencies
import { describe, test, expect, beforeEach } from 'vitest'

// Thing under test
import { businessDetailsPresenter } from '../../../../src/presenters/business/business-details-presenter.js'

describe('businessDetailsPresenter', () => {
  let data
  let sbi

  beforeEach(() => {
    sbi = '106705779'

    data = {
      info: {
        sbi,
        businessName: 'Herberts Lawn Mowing',
        vat: 'GB123456789',
        traderNumber: '123456',
        vendorNumber: '654321',
        legalStatus: 'Sole Proprietorship',
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

    expect(result.pageTitle).toBe('View business details')
  })

  test('returns the sbi', () => {
    const result = businessDetailsPresenter(data, sbi)

    expect(result.sbi).toBe(sbi)
  })

  test('returns breadcrumbs for search results and the business overview', () => {
    const result = businessDetailsPresenter(data, sbi)

    expect(result.breadcrumbs).toEqual([
      { text: 'Search results', href: `/search-sbi?sbi=${sbi}` },
      { text: `Herberts Lawn Mowing (SBI: ${sbi})`, href: `/business/${sbi}` }
    ])
  })

  test('falls back to just the SBI in the overview breadcrumb when the business name is absent', () => {
    data.info.businessName = null
    const result = businessDetailsPresenter(data, sbi)

    expect(result.breadcrumbs[1]).toEqual({ text: `SBI: ${sbi}`, href: `/business/${sbi}` })
  })

  describe('businessName', () => {
    test('returns the business name value and "Change" action when populated', () => {
      const result = businessDetailsPresenter(data, sbi)

      expect(result.businessName.value).toBe('Herberts Lawn Mowing')
      expect(result.businessName.action).toBe('Change')
      expect(result.businessName.changeLink).toBe('#')
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
      expect(result.businessAddress.changeLink).toBe('#')
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
      expect(result.businessTelephone.changeLink).toBe('#')
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
      expect(result.businessEmail.changeLink).toBe('#')
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
      expect(result.vatNumber.changeLink).toBe('#')
    })

    test('returns "No number added" and "Add" action when VAT is absent', () => {
      data.info.vat = null
      const result = businessDetailsPresenter(data, sbi)

      expect(result.vatNumber.value).toBe('No number added')
      expect(result.vatNumber.action).toBe('Add')
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
      expect(result.businessLegalStatus.changeLink).toBe('#')
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
})
