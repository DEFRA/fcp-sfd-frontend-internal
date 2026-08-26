// Test framework dependencies
import { describe, test, expect, beforeEach } from 'vitest'

// Thing under test
import { businessAddressChangePresenter } from '../../../../src/presenters/business/business-address-change-presenter.js'

describe('businessAddressChangePresenter', () => {
  let data
  let payload

  beforeEach(() => {
    data = {
      info: { sbi: '106705779', businessName: 'Herberts Lawn Mowing' },
      changeBusinessPostcode: { postcode: 'SW1A 1AA' },
      address: { postcode: 'SW1A 1AA' }
    }
    payload = undefined
  })

  describe('when provided with business address change data', () => {
    test('it correctly presents the data', () => {
      const result = businessAddressChangePresenter(data, payload)

      expect(result).toEqual({
        backLink: '/business/106705779/details',
        manualAddressLink: '/business/106705779/business-address-enter',
        pageTitle: 'What is your business address?',
        metaDescription: 'Update the address for your business.',
        postcode: 'SW1A 1AA'
      })
    })
  })

  describe('when payload is provided', () => {
    beforeEach(() => {
      payload = 'SW1B 2AA'
    })

    test('it uses the payload postcode instead of session data', () => {
      const result = businessAddressChangePresenter(data, payload)

      expect(result.postcode).toBe('SW1B 2AA')
    })
  })

  describe('when there is no session data and no payload', () => {
    beforeEach(() => {
      data.changeBusinessPostcode = undefined
    })

    test('it falls back to the original address postcode', () => {
      const result = businessAddressChangePresenter(data, payload)

      expect(result.postcode).toBe('SW1A 1AA')
    })
  })
})
