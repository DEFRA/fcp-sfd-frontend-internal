// Test framework dependencies
import { describe, test, expect, beforeEach, vi } from 'vitest'

// Thing under test
import { businessLegalStatusChangePresenter } from '../../../../src/presenters/business/business-legal-status-change-presenter.js'

describe('businessLegalStatusChangePresenter', () => {
  let data

  beforeEach(() => {
    vi.clearAllMocks()

    data = {
      info: {
        businessName: 'HENLEY, RE',
        legalStatus: 'Sole Proprietorship',
        sbi: '123456789'
      },
      customer: {
        fullName: 'Alfred Waldron'
      }
    }
  })

  describe('when provided with business legal status change data', () => {
    test('it correctly presents the data', () => {
      const result = businessLegalStatusChangePresenter(data)

      expect(result).toEqual({
        backLink: { href: '/business-details' },
        pageTitle: 'Change your legal status',
        metaDescription: 'Update the legal status of your business.',
        businessName: 'HENLEY, RE',
        businessLegalStatus: 'Sole Proprietorship',
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
        const result = businessLegalStatusChangePresenter(data)
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
        const result = businessLegalStatusChangePresenter(data)
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
        const result = businessLegalStatusChangePresenter(data)
        expect(result.userName).toEqual(null)
      })
    })
  })

  describe('the "businessLegalStatus" property', () => {
    describe('when the businessLegalStatus property is missing', () => {
      beforeEach(() => {
        delete data.info.legalStatus
      })

      test('it should return businessLegalStatus as null', () => {
        const result = businessLegalStatusChangePresenter(data)

        expect(result.businessLegalStatus).toEqual(null)
      })
    })
  })
})
