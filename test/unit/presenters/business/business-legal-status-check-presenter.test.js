// Test framework dependencies
import { describe, test, expect, beforeEach } from 'vitest'
import { constants } from '@defra/fcp-sfd-frontend-engine'

// Thing under test
import { businessLegalStatusCheckPresenter } from '../../../../src/presenters/business/business-legal-status-check-presenter.js'

describe('businessLegalStatusCheckPresenter', () => {
  let data

  beforeEach(() => {
    data = {
      info: { sbi: '106705779', legalStatusCode: '102111', legalStatus: 'Sole proprietorship' }
    }
  })

  describe('when provided with business legal status check data', () => {
    test('it correctly presents the data', () => {
      const result = businessLegalStatusCheckPresenter(data)

      expect(result.pageTitle).toBe('Check your business legal status is correct before submitting')
      expect(result.metaDescription).toBe('Check the legal status of this business is correct.')
      expect(result.businessLegalStatus).toBe('Sole proprietorship')
    })
  })

  describe('when the legal status does not require a registration number', () => {
    test('the back link and legal status change link point to the change page', () => {
      const result = businessLegalStatusCheckPresenter(data)

      expect(result.backLink).toEqual({ href: '/business/106705779/business-legal-status-change' })
      expect(result.legalStatusChangeLink).toBe('/business/106705779/business-legal-status-change')
    })

    test('no registration number is displayed', () => {
      const result = businessLegalStatusCheckPresenter(data)

      expect(result.registrationNumberLabel).toBeNull()
      expect(result.registrationNumber).toBeNull()
    })

    test('it does not require a registration number when no legal status code is available at all', () => {
      delete data.info.legalStatusCode

      const result = businessLegalStatusCheckPresenter(data)

      expect(result.legalStatusChangeLink).toBe('/business/106705779/business-legal-status-change')
      expect(result.registrationNumberLabel).toBeNull()
    })
  })

  describe('when the legal status requires a charity registration number', () => {
    beforeEach(() => {
      data.changeBusinessLegalStatus = constants.business.CHARITY_REGISTRATION_LEGAL_STATUS_CODES[0]
      data.changeBusinessCharityCommissionRegistrationNumber = '1234567'
    })

    test('the back link points to the enter page, but the legal status change link still points to the change page', () => {
      const result = businessLegalStatusCheckPresenter(data)

      expect(result.backLink).toEqual({ href: '/business/106705779/business-legal-status-enter' })
      expect(result.legalStatusChangeLink).toBe('/business/106705779/business-legal-status-change')
    })

    test('the registration number change link points to the enter page', () => {
      const result = businessLegalStatusCheckPresenter(data)

      expect(result.registrationNumberChangeLink).toBe('/business/106705779/business-legal-status-enter')
    })

    test('the charity registration number is played back', () => {
      const result = businessLegalStatusCheckPresenter(data)

      expect(result.registrationNumberLabel).toBe('Charity commission registration number')
      expect(result.registrationNumber).toBe('1234567')
    })
  })

  describe('when the legal status requires a company registration number', () => {
    beforeEach(() => {
      data.changeBusinessLegalStatus = constants.business.COMPANY_REGISTRATION_LEGAL_STATUS_CODES[0]
      data.changeBusinessCompanyRegistrationNumber = '12345678'
    })

    test('the back link points to the enter page, but the legal status change link still points to the change page', () => {
      const result = businessLegalStatusCheckPresenter(data)

      expect(result.backLink).toEqual({ href: '/business/106705779/business-legal-status-enter' })
      expect(result.legalStatusChangeLink).toBe('/business/106705779/business-legal-status-change')
    })

    test('the registration number change link points to the enter page', () => {
      const result = businessLegalStatusCheckPresenter(data)

      expect(result.registrationNumberChangeLink).toBe('/business/106705779/business-legal-status-enter')
    })

    test('the company registration number is played back', () => {
      const result = businessLegalStatusCheckPresenter(data)

      expect(result.registrationNumberLabel).toBe('Company registration number')
      expect(result.registrationNumber).toBe('12345678')
    })
  })

  describe('the "backLink" property', () => {
    test('it falls back to the search page when the sbi is missing', () => {
      delete data.info.sbi

      const result = businessLegalStatusCheckPresenter(data)

      expect(result.backLink).toEqual({ href: '/search-sbi' })
    })
  })

  describe('when the sbi is missing', () => {
    test('the legal status and registration number change links also fall back to the search page', () => {
      delete data.info.sbi

      const result = businessLegalStatusCheckPresenter(data)

      expect(result.legalStatusChangeLink).toBe('/search-sbi')
      expect(result.registrationNumberChangeLink).toBe('/search-sbi')
    })
  })

  describe('the "businessLegalStatus" property', () => {
    test('it uses the in-progress session change over the fetched legal status text', () => {
      data.changeBusinessLegalStatus = constants.business.CHARITY_REGISTRATION_LEGAL_STATUS_CODES[0]

      const result = businessLegalStatusCheckPresenter(data)

      expect(result.businessLegalStatus).not.toBe('Sole proprietorship')
    })

    test('it falls back to the fetched legal status when the session change does not match a known code', () => {
      data.changeBusinessLegalStatus = '999999'

      const result = businessLegalStatusCheckPresenter(data)

      expect(result.businessLegalStatus).toBe('Sole proprietorship')
    })

    test('it is null when there is no session change and no fetched legal status text', () => {
      delete data.info.legalStatus

      const result = businessLegalStatusCheckPresenter(data)

      expect(result.businessLegalStatus).toBeNull()
    })
  })

  describe('the "registrationNumber" property', () => {
    test('it is null when a charity status is selected but no number has been entered yet', () => {
      data.changeBusinessLegalStatus = constants.business.CHARITY_REGISTRATION_LEGAL_STATUS_CODES[0]

      const result = businessLegalStatusCheckPresenter(data)

      expect(result.registrationNumber).toBeNull()
    })

    test('it is null when a company status is selected but no number has been entered yet', () => {
      data.changeBusinessLegalStatus = constants.business.COMPANY_REGISTRATION_LEGAL_STATUS_CODES[0]

      const result = businessLegalStatusCheckPresenter(data)

      expect(result.registrationNumber).toBeNull()
    })
  })
})
