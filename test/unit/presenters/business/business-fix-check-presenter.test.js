// Test framework dependencies
import { describe, test, expect, beforeEach } from 'vitest'

// Thing under test
import { businessFixCheckPresenter } from '../../../../src/presenters/business/business-fix-check-presenter.js'

describe('businessFixCheckPresenter', () => {
  const sbi = '107183280'
  let data

  beforeEach(() => {
    data = {
      orderedSectionsToFix: ['name', 'email'],
      info: { businessName: 'Herberts Lawn Mowing' },
      changeBusinessName: { businessName: 'Herberts Hedge Trimming' },
      changeBusinessEmail: { businessEmail: 'new@example.com' }
    }
  })

  describe('when provided with business fix data', () => {
    test('it correctly presents the data', () => {
      const result = businessFixCheckPresenter(data, sbi)

      expect(result).toEqual({
        backLink: `/business/${sbi}/details/fix-list`,
        pageTitle: 'Check your details are correct before submitting',
        metaDescription: 'Check your details are correct before submitting',
        businessName: 'Herberts Lawn Mowing',
        sbi,
        changeLink: `/business/${sbi}/details/fix-list`,
        sections: ['name', 'email'],
        changeBusinessName: 'Herberts Hedge Trimming',
        address: null,
        businessTelephone: { telephone: null, mobile: null },
        businessEmail: 'new@example.com',
        vatNumber: null
      })
    })
  })

  describe('the "backLink" property', () => {
    test('it falls back to the search page when the sbi is missing', () => {
      const result = businessFixCheckPresenter(data, undefined)

      expect(result.backLink).toEqual('/search-sbi')
    })
  })

  describe('when the business name is missing', () => {
    test('it returns null as the "businessName" property', () => {
      data.info.businessName = undefined

      const result = businessFixCheckPresenter(data, sbi)

      expect(result.businessName).toBeNull()
    })
  })

  describe('when there is no changed business name', () => {
    test('it returns null as the "changeBusinessName" property', () => {
      delete data.changeBusinessName

      const result = businessFixCheckPresenter(data, sbi)

      expect(result.changeBusinessName).toBeNull()
    })
  })

  describe('the "address" property', () => {
    beforeEach(() => {
      data.changeBusinessAddress = {
        address1: '10 Skirbeck Way',
        address2: '',
        address3: null,
        city: 'Maidstone',
        county: '',
        postcode: 'ME20 6RL',
        country: 'United Kingdom'
      }
    })

    test('it returns the populated address lines only', () => {
      const result = businessFixCheckPresenter(data, sbi)

      expect(result.address).toEqual([
        '10 Skirbeck Way',
        'Maidstone',
        'ME20 6RL',
        'United Kingdom'
      ])
    })
  })

  describe('the "businessTelephone" property', () => {
    beforeEach(() => {
      data.changeBusinessPhoneNumbers = {
        businessTelephone: '01234567890',
        businessMobile: ''
      }
    })

    test('it returns the telephone and mobile', () => {
      const result = businessFixCheckPresenter(data, sbi)

      expect(result.businessTelephone).toEqual({ telephone: '01234567890', mobile: '' })
    })
  })

  describe('when there is no changed business email', () => {
    test('it returns null as the "businessEmail" property', () => {
      delete data.changeBusinessEmail

      const result = businessFixCheckPresenter(data, sbi)

      expect(result.businessEmail).toBeNull()
    })
  })

  describe('the "vatNumber" property', () => {
    beforeEach(() => {
      data.changeBusinessVat = { vatNumber: '123456789' }
    })

    test('it returns the vat number', () => {
      const result = businessFixCheckPresenter(data, sbi)

      expect(result.vatNumber).toEqual('123456789')
    })
  })
})
