// Test framework dependencies
import { describe, test, expect, beforeEach } from 'vitest'

// Thing under test
import { businessFixPresenter } from '../../../../src/presenters/business/business-fix-presenter.js'

describe('businessFixPresenter', () => {
  const sbi = '107183280'
  let data

  describe('when provided with business fix data', () => {
    beforeEach(() => {
      data = {
        source: 'name',
        orderedSectionsToFix: ['name'],
        info: { businessName: 'Herberts Lawn Mowing' }
      }
    })

    test('it correctly presents the data', () => {
      const result = businessFixPresenter(data, sbi)

      expect(result).toEqual({
        backLink: `/business/${sbi}/details`,
        pageTitle: 'Update your business details',
        metaDescription: 'Update your business details.',
        businessName: 'Herberts Lawn Mowing',
        sbi,
        updateText: 'We will ask you to update these details as well as your business name:',
        listOfErrors: []
      })
    })
  })

  describe('the "backLink" property', () => {
    beforeEach(() => {
      data = { source: 'name', orderedSectionsToFix: ['name'] }
    })

    test('it includes the sbi in the URL', () => {
      const result = businessFixPresenter(data, sbi)

      expect(result.backLink).toEqual(`/business/${sbi}/details`)
    })

    test('it falls back to the search page when the sbi is missing', () => {
      const result = businessFixPresenter(data, undefined)

      expect(result.backLink).toEqual('/search-sbi')
    })
  })

  describe('the "businessName" property', () => {
    test('it returns null when there is no business name', () => {
      data = { source: 'name', orderedSectionsToFix: ['name'] }

      const result = businessFixPresenter(data, sbi)

      expect(result.businessName).toBeNull()
    })
  })

  describe('the "updateText" property', () => {
    describe('when two sections need fixing', () => {
      beforeEach(() => {
        data = {
          source: 'name',
          orderedSectionsToFix: ['name', 'email']
        }
      })

      test('it returns a combined update message', () => {
        const result = businessFixPresenter(data, sbi)

        expect(result.updateText)
          .toEqual('We will ask you to update your business email address as well as your business name.')
      })
    })

    describe('when more than two sections need fixing and a source is provided', () => {
      beforeEach(() => {
        data = {
          source: 'address',
          orderedSectionsToFix: ['address', 'phone', 'vat']
        }
      })

      test('it references the source section in the update text', () => {
        const result = businessFixPresenter(data, sbi)

        expect(result.updateText)
          .toEqual('We will ask you to update these details as well as your business address:')
      })
    })

    describe('when no source is provided', () => {
      beforeEach(() => {
        data = {
          orderedSectionsToFix: ['name', 'phone', 'email']
        }
      })

      test('it returns the generic update text', () => {
        const result = businessFixPresenter(data, sbi)

        expect(result.updateText).toEqual('We will ask you to update these details.')
      })
    })
  })

  describe('the "listOfErrors" property', () => {
    describe('when two or fewer sections need fixing', () => {
      beforeEach(() => {
        data = {
          source: 'name',
          orderedSectionsToFix: ['name', 'email']
        }
      })

      test('it returns an empty list', () => {
        const result = businessFixPresenter(data, sbi)

        expect(result.listOfErrors).toEqual([])
      })
    })

    describe('when more than two sections need fixing', () => {
      beforeEach(() => {
        data = {
          source: 'vat',
          orderedSectionsToFix: ['vat', 'name', 'phone']
        }
      })

      test('it lists the other sections in display order, excluding the source', () => {
        const result = businessFixPresenter(data, sbi)

        expect(result.listOfErrors).toEqual([
          'business name',
          'at least one business phone number'
        ])
      })
    })
  })
})
