// Test framework dependencies
import { describe, test, expect, beforeEach } from 'vitest'

// Thing under test
import { businessFixListPresenter } from '../../../../src/presenters/business/business-fix-list-presenter.js'

describe('businessFixListPresenter', () => {
  const sbi = '107183280'
  let data

  beforeEach(() => {
    data = {
      source: 'name',
      orderedSectionsToFix: ['name', 'email'],
      info: {
        businessName: 'Herberts Lawn Mowing',
        vat: '123456789'
      },
      contact: {
        email: 'herbert@example.com',
        landline: '01234567890',
        mobile: '07700900000'
      }
    }
  })

  describe('when provided with business fix data', () => {
    test('it correctly presents the data', () => {
      const result = businessFixListPresenter(data, null, sbi, null)

      expect(result).toEqual({
        backLink: `/business/${sbi}/details/fix?source=name`,
        pageTitle: 'Your business details to update',
        metaDescription: 'Your business details to update.',
        businessName: 'Herberts Lawn Mowing',
        sbi,
        sections: ['name', 'email'],
        changeBusinessName: 'Herberts Lawn Mowing',
        businessTelephone: '01234567890',
        businessMobile: '07700900000',
        businessEmail: 'herbert@example.com',
        address: null,
        vatNumber: '123456789',
        errors: null
      })
    })
  })

  describe('the "backLink" property', () => {
    test('it includes the sbi and source in the URL', () => {
      const result = businessFixListPresenter(data, null, sbi, null)

      expect(result.backLink).toEqual(`/business/${sbi}/details/fix?source=name`)
    })

    test('it falls back to the search page when the sbi is missing', () => {
      const result = businessFixListPresenter(data, null, undefined, null)

      expect(result.backLink).toEqual('/search-sbi')
    })
  })

  describe('when the user has already submitted fixes', () => {
    beforeEach(() => {
      data.changeBusinessName = { businessName: 'Herberts Hedge Trimming' }
      data.changeBusinessEmail = { businessEmail: 'new@example.com' }
      data.changeBusinessVat = { vatNumber: '987654321' }
    })

    test('it prefers the session values over the live details', () => {
      const result = businessFixListPresenter(data, null, sbi, null)

      expect(result.changeBusinessName).toEqual('Herberts Hedge Trimming')
      expect(result.businessEmail).toEqual('new@example.com')
      expect(result.vatNumber).toEqual('987654321')
    })
  })

  describe('when a payload is provided', () => {
    let payload

    beforeEach(() => {
      payload = {
        businessName: 'Herberts Fencing',
        businessEmail: 'payload@example.com',
        vatNumber: '111222333',
        address1: '10 Skirbeck Way',
        address2: '',
        address3: '',
        city: 'Maidstone',
        county: '',
        postcode: 'ME20 6RL',
        country: 'United Kingdom'
      }
    })

    test('it prefers the payload values', () => {
      const result = businessFixListPresenter(data, payload, sbi, null)

      expect(result.changeBusinessName).toEqual('Herberts Fencing')
      expect(result.businessEmail).toEqual('payload@example.com')
      expect(result.vatNumber).toEqual('111222333')
    })

    test('it returns the address from the payload', () => {
      const result = businessFixListPresenter(data, payload, sbi, null)

      expect(result.address).toEqual({
        address1: '10 Skirbeck Way',
        address2: '',
        address3: '',
        city: 'Maidstone',
        county: '',
        postcode: 'ME20 6RL',
        country: 'United Kingdom'
      })
    })
  })

  describe('when there is a changed business address and no payload', () => {
    beforeEach(() => {
      data.changeBusinessAddress = {
        address1: '2 Changed Road',
        address2: 'Changed Area',
        address3: '',
        city: 'Changedville',
        county: 'Changedshire',
        postcode: 'CH2 2NG',
        country: 'UK'
      }
    })

    test('it returns the changed business address as the "address" property', () => {
      const result = businessFixListPresenter(data, null, sbi, null)

      expect(result.address).toEqual({
        address1: '2 Changed Road',
        address2: 'Changed Area',
        address3: '',
        city: 'Changedville',
        county: 'Changedshire',
        postcode: 'CH2 2NG',
        country: 'UK'
      })
    })
  })

  describe('when the business name is missing', () => {
    test('it returns null for the "businessName" and "changeBusinessName" properties', () => {
      data.info.businessName = undefined

      const result = businessFixListPresenter(data, null, sbi, null)

      expect(result.businessName).toBeNull()
      expect(result.changeBusinessName).toBeNull()
    })
  })

  describe('the "errors" property', () => {
    test('it returns null when there are no errors', () => {
      const result = businessFixListPresenter(data, null, sbi, null)

      expect(result.errors).toBeNull()
    })

    test('it orders the errors by section field order', () => {
      data.orderedSectionsToFix = ['email', 'name']

      const errors = {
        businessName: { text: 'Enter the business name' },
        businessEmail: { text: 'Enter the business email address' }
      }

      const result = businessFixListPresenter(data, null, sbi, errors)

      expect(result.errors).toEqual([
        { field: 'businessEmail', text: 'Enter the business email address' },
        { field: 'businessName', text: 'Enter the business name' }
      ])
    })
  })
})
