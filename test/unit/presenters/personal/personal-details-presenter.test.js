// Test framework dependencies
import { describe, test, expect, beforeEach, vi } from 'vitest'

// Thing under test
import { personalDetailsPresenter } from '../../../../src/presenters/personal/personal-details-presenter.js'

// Dependencies
import { addressPresenter } from '../../../../src/presenters/address-presenter.js'

// Mock data
import { mappedData as originalData } from '../../../mocks/mock-personal-details.js'

describe('personalDetailsPresenter', () => {
  let yar
  let data

  vi.mock('../../../../src/presenters/address-presenter.js', () => ({
    addressPresenter: {
      formatAddress: vi.fn().mockReturnValue([
        'THE COACH HOUSE',
        'STOCKWELL HALL',
        '7 HAREWOOD AVENUE',
        'DARLINGTON',
        'Dorset',
        'CO9 3LS',
        'United Kingdom'
      ])
    }
  }))

  beforeEach(() => {
    vi.clearAllMocks()

    // Deep clone the data to avoid mutation across tests
    data = JSON.parse(JSON.stringify(originalData))

    // Mock yar session manager
    yar = {
      flash: vi.fn().mockReturnValue([{ title: 'Update', text: 'Personal details updated successfully' }])
    }
  })

  describe('when provided with personal details data', () => {
    test('it correctly presents the data', () => {
      const result = personalDetailsPresenter(data, yar)

      expect(result).toEqual({
        backLink: { href: '/home' },
        notification: { title: 'Update', text: 'Personal details updated successfully' },
        pageTitle: 'View and update your personal details',
        metaDescription: 'View and update your personal details.',
        address: addressPresenter.formatAddress(data.address),
        crn: data.crn,
        fullName: 'John M Doe', // Assumes your mock fullName is { first: 'John', middle: 'M', last: 'Doe' }
        dateOfBirth: data.info.dateOfBirth,
        personalTelephone: data.contact.telephone ?? 'Not added',
        personalMobile: data.contact.mobile ?? 'Not added',
        personalEmail: data.contact.email
      })
    })
  })

  describe('the "personalTelephone" property', () => {
    test('returns "Not added" if telephone is missing', () => {
      data.contact.telephone = null

      const result = personalDetailsPresenter(data, yar)

      expect(result.personalTelephone).toBe('Not added')
    })
  })

  describe('the "personalMobile" property', () => {
    test('returns "Not added" if mobile is missing', () => {
      data.contact.mobile = null

      const result = personalDetailsPresenter(data, yar)

      expect(result.personalMobile).toBe('Not added')
    })
  })

  describe('the "notification" property', () => {
    test('returns null if yar is falsy', () => {
      const result = personalDetailsPresenter(data, null)

      expect(result.notification).toBe(null)
    })
  })

  describe('the "fullName" property', () => {
    test('returns a formatted full name', () => {
      const result = personalDetailsPresenter(data, yar)

      expect(result.fullName).toBe('John M Doe')
    })

    describe('when there is no middle name', () => {
      test('returns a formatted full name without the middle name', () => {
        data.info.fullName.middle = null

        const result = personalDetailsPresenter(data, yar)

        expect(result.fullName).toBe('John Doe')
      })
    })
  })
})
