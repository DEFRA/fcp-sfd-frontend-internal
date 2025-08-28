// Test framework dependencies
import { describe, test, expect, beforeEach, vi } from 'vitest'

// Thing under test
import { businessDetailsPresenter } from '../../../../src/presenters/business/business-details-presenter.js'

describe('businessDetailsPresenter', () => {
  let yar
  let data

  beforeEach(async () => {
    vi.clearAllMocks()
    vi.resetModules() // vi is weird about clearing modules after each test, you must import AFTER calling reset
    const { mappedData } = await import('../../../mocks/mock-business-details.js')
    data = mappedData

    // Mock yar session manager
    yar = {
      flash: vi.fn().mockReturnValue([{ title: 'Update', text: 'Business details updated successfully' }])
    }
  })

  describe('when provided with business details data', () => {
    test('it correctly presents the data', () => {
      const result = businessDetailsPresenter(data, yar)

      expect(result).toEqual({
        notification: { title: 'Update', text: 'Business details updated successfully' },
        pageTitle: 'View and update your business details',
        metaDescription: 'View and change the details for your business.',
        address: [
          'THE COACH HOUSE',
          'STOCKWELL HALL',
          '7 HAREWOOD AVENUE',
          'DARLINGTON',
          'Dorset',
          'CO9 3LS',
          'United Kingdom'
        ],
        businessName: data.info.businessName,
        businessTelephone: data.contact.landline,
        businessMobile: data.mobile ?? 'Not added',
        businessEmail: data.contact.email,
        sbi: data.info.sbi,
        vatNumber: data.info.vat,
        tradeNumber: data.info.traderNumber,
        vendorRegistrationNumber: data.info.vendorNumber,
        countyParishHoldingNumbers: ['12/123/1234'],
        businessLegalStatus: data.info.legalStatus,
        businessType: data.info.type,
        userName: data.customer.fullName
      })
    })
  })

  describe('the "businessTelephone" property', () => {
    describe('when the landline property is missing', () => {
      test('it should return the text "Not added', () => {
        data.contact.landline = null
        const result = businessDetailsPresenter(data, yar)

        expect(result.businessTelephone).toEqual('Not added')
      })
    })
  })

  describe('the "businessMobile" property', () => {
    describe('when the businessMobile property is missing', () => {
      test('it should return the text "Not added', () => {
        const result = businessDetailsPresenter(data, yar)

        expect(result.businessMobile).toEqual('Not added')
      })
    })
  })

  describe('the "vatNumber" property', () => {
    describe('when the property is null', () => {
      test('it should return null', () => {
        data.info.vat = null
        const result = businessDetailsPresenter(data, yar)

        expect(result.vatNumber).toEqual(null)
      })
    })
  })

  describe('the "cph" property', () => {
    describe('when the property is empty', () => {
      test('it should return empty array', () => {
        data.info.countyParishHoldingNumbers = []
        const result = businessDetailsPresenter(data, yar)

        expect(result.countyParishHoldingNumbers).toEqual([])
      })
    })
  })

  describe('the "traderNumber" property', () => {
    describe('when the property is null', () => {
      test('it should return null', () => {
        data.info.traderNumber = null
        const result = businessDetailsPresenter(data, yar)

        expect(result.tradeNumber).toEqual(null)
      })
    })
  })

  describe('the "vendorRegistrationNumber" property', () => {
    describe('when the property is null', () => {
      test('it should return null', () => {
        data.info.vendorNumber = null
        const result = businessDetailsPresenter(data, yar)

        expect(result.vendorRegistrationNumber).toEqual(null)
      })
    })
  })

  describe('the "notification" property', () => {
    describe('when yar is falsey', () => {
      test('it should return null', () => {
        yar = null
        const result = businessDetailsPresenter(data, yar)

        expect(result.notification).toEqual(null)
      })
    })
  })
})
