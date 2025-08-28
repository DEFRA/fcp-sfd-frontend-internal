// Test framework dependencies
import { describe, test, expect, beforeEach, vi } from 'vitest'

// Thing under test
import { businessTypeChangePresenter } from '../../../../src/presenters/business/business-type-change-presenter.js'

describe('businessTypeChangePresenter', () => {
  let data
  let payload

  beforeEach(() => {
    vi.clearAllMocks()

    data = {
      info: {
        businessName: 'Agile Farm Ltd',
        type: 'Farmer',
        sbi: '123456789'
      },
      customer: {
        fullName: 'Alfred Waldron'
      }
    }
  })

  describe('when provided with business type change data', () => {
    test('it correctly presents the data', () => {
      const result = businessTypeChangePresenter(data)

      expect(result).toEqual({
        backLink: { href: '/business-details' },
        pageTitle: 'Change your business type',
        metaDescription: 'Update the type of your business.',
        businessName: 'Agile Farm Ltd',
        businessType: 'Farmer',
        sbi: '123456789',
        userName: 'Alfred Waldron'
      })
    })
  })

  describe('the "businessName" property', () => {
    describe('when the businessName property is missing', () => {
      beforeEach(() => {
        delete data.info.businessName
      })

      test('it should return businessName as null', () => {
        const result = businessTypeChangePresenter(data)

        expect(result.businessName).toEqual(null)
      })
    })
  })

  describe('the "sbi" property', () => {
    describe('when the sbi (singleBusinessIdentifier) property is missing', () => {
      beforeEach(() => {
        delete data.info.sbi
      })

      test('it should return sbi as null', () => {
        const result = businessTypeChangePresenter(data)

        expect(result.sbi).toEqual(null)
      })
    })
  })

  describe('the "userName" property', () => {
    describe('when the userName property is missing', () => {
      beforeEach(() => {
        delete data.customer.fullName
      })

      test('it should return userName as null', () => {
        const result = businessTypeChangePresenter(data)

        expect(result.userName).toEqual(null)
      })
    })
  })

  describe('the "businessType" property', () => {
    describe('when the type property is missing', () => {
      beforeEach(() => {
        delete data.info.type
      })

      test('it should return businessType as null', () => {
        const result = businessTypeChangePresenter(data)

        expect(result.businessType).toEqual(null)
      })
    })

    describe('when provided with a changed businessType', () => {
      beforeEach(() => {
        data.changeBusinessType = 'Limited Company'
      })

      test('it should return the changed businessType as the businessType', () => {
        const result = businessTypeChangePresenter(data)

        expect(result.businessType).toEqual('Limited Company')
      })
    })

    describe('when provided with a payload', () => {
      beforeEach(() => {
        payload = 'Partnership'
      })

      test('it should return the payload as the businessType', () => {
        const result = businessTypeChangePresenter(data, payload)

        expect(result.businessType).toEqual('Partnership')
      })
    })
  })
})
