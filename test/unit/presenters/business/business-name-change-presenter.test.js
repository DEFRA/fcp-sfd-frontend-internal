// Test framework dependencies
import { describe, test, expect, beforeEach, vi } from 'vitest'

// Thing under test
import { businessNameChangePresenter } from '../../../../src/presenters/business/business-name-change-presenter.js'

describe('businessNameChangePresenter', () => {
  let data
  let payload

  beforeEach(() => {
    vi.clearAllMocks()

    data = {
      businessName: 'Agile Farm Ltd',
      changeBusinessName: 'Agile Farm Ltd',
      sbi: '123456789',
      userName: 'Alfred Waldron'
    }

    data = {
      info: {
        businessName: 'Agile Farm Ltd',
        sbi: '123456789'
      },
      customer: {
        fullName: 'Alfred Waldron'
      }
    }
  })

  describe('when provided with business name change data', () => {
    test('it correctly presents the data', () => {
      const result = businessNameChangePresenter(data)

      expect(result).toEqual({
        backLink: { href: '/business-details' },
        pageTitle: 'What is your business name?',
        metaDescription: 'Update the name for your business.',
        businessName: 'Agile Farm Ltd',
        changeBusinessName: 'Agile Farm Ltd',
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
        const result = businessNameChangePresenter(data)

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
        const result = businessNameChangePresenter(data)

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
        const result = businessNameChangePresenter(data)

        expect(result.userName).toEqual(null)
      })
    })
  })

  describe('the "changeBusinessName" property', () => {
    describe('when the changeBusinessName property is missing', () => {
      beforeEach(() => {
        delete data.changeBusinessName
      })

      test('it should fallback to businessName value', () => {
        const result = businessNameChangePresenter(data)

        expect(result.changeBusinessName).toEqual('Agile Farm Ltd')
      })
    })

    describe('when provided with a payload', () => {
      beforeEach(() => {
        payload = 'New business Name ltd'
      })

      test('it should return the payload as the changedBusinessName', () => {
        const result = businessNameChangePresenter(data, payload)

        expect(result.changeBusinessName).toEqual('New business Name ltd')
      })
    })
  })
})
