// Test framework dependencies
import { describe, test, expect, beforeEach } from 'vitest'

// Thing under test
import { businessLegalStatusChangePresenter } from '../../../../src/presenters/business/business-legal-status-change-presenter.js'

describe('businessLegalStatusChangePresenter', () => {
  let data
  let payload

  beforeEach(() => {
    data = {
      info: { sbi: '106705779', legalStatusCode: '102111' }
    }
    payload = undefined
  })

  describe('when provided with business legal status data', () => {
    test('it correctly presents the data', () => {
      const result = businessLegalStatusChangePresenter(data, payload)

      expect(result.backLink).toEqual({ href: '/business/106705779/details' })
      expect(result.pageTitle).toBe('Change legal status')
      expect(result.metaDescription).toBe('Update the legal status of this business.')
      expect(result.businessLegalStatus).toBe('102111')
    })
  })

  describe('the "backLink" property', () => {
    test('it builds the back link from the sbi details page when the sbi is present', () => {
      const result = businessLegalStatusChangePresenter(data, payload)

      expect(result.backLink).toEqual({ href: '/business/106705779/details' })
    })

    test('it falls back to the search page when the sbi is missing', () => {
      delete data.info.sbi
      const result = businessLegalStatusChangePresenter(data, payload)

      expect(result.backLink).toEqual({ href: '/search-sbi' })
    })
  })

  describe('the "businessLegalStatus" property', () => {
    test('it uses the current legal status code when there is no change or payload', () => {
      const result = businessLegalStatusChangePresenter(data, payload)

      expect(result.businessLegalStatus).toBe('102111')
    })

    test('it uses the in-progress session change over the fetched data', () => {
      data.changeBusinessLegalStatus = '102105'
      const result = businessLegalStatusChangePresenter(data, payload)

      expect(result.businessLegalStatus).toBe('102105')
    })

    test('it uses the submitted payload over the session change and fetched data', () => {
      data.changeBusinessLegalStatus = '102105'
      payload = '102109'
      const result = businessLegalStatusChangePresenter(data, payload)

      expect(result.businessLegalStatus).toBe('102109')
    })

    test('it is undefined when the legal status has not been specified', () => {
      delete data.info.legalStatusCode
      const result = businessLegalStatusChangePresenter(data, payload)

      expect(result.businessLegalStatus).toBeUndefined()
    })
  })

  describe('the "businessLegalStatusItems" property', () => {
    test('it returns an item for every legal status option', () => {
      const result = businessLegalStatusChangePresenter(data, payload)

      expect(result.businessLegalStatusItems).toHaveLength(14)
      expect(result.businessLegalStatusItems).toContainEqual({
        value: '102111',
        text: 'Sole proprietorship',
        checked: true
      })
    })

    test('it marks only the option matching the selected code as checked', () => {
      const result = businessLegalStatusChangePresenter(data, payload)

      const checkedItems = result.businessLegalStatusItems.filter((item) => item.checked)

      expect(checkedItems).toHaveLength(1)
      expect(checkedItems[0]).toEqual({ value: '102111', text: 'Sole proprietorship', checked: true })
    })

    test('it matches the code as a string even when the selected value is numeric', () => {
      data.info.legalStatusCode = 102111
      const result = businessLegalStatusChangePresenter(data, payload)

      const checkedItems = result.businessLegalStatusItems.filter((item) => item.checked)

      expect(checkedItems).toHaveLength(1)
      expect(checkedItems[0].value).toBe('102111')
    })

    test('it leaves every option unchecked when nothing has been selected', () => {
      delete data.info.legalStatusCode
      const result = businessLegalStatusChangePresenter(data, payload)

      const checkedItems = result.businessLegalStatusItems.filter((item) => item.checked)

      expect(checkedItems).toHaveLength(0)
    })
  })
})
