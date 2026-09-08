// Test framework dependencies
import { describe, test, expect, beforeEach } from 'vitest'

// Thing under test
import { personalFixPresenter } from '../../../../src/presenters/personal/personal-fix-presenter.js'

describe('personalFixPresenter', () => {
  const crn = '123456789'
  let data

  describe('when provided with personal fix data', () => {
    beforeEach(() => {
      data = {
        source: 'name',
        orderedSectionsToFix: ['name']
      }
    })

    test('it correctly presents the data', () => {
      const result = personalFixPresenter(data, crn)

      expect(result).toEqual({
        backLink: `/customer/${crn}/details`,
        pageTitle: 'Update your personal details',
        metaDescription: 'Update your personal details.',
        userName: null,
        crn,
        updateText: 'We will ask you to update these details as well as your full name:',
        listOfErrors: []
      })
    })
  })

  describe('the "backLink" property', () => {
    test('it includes the crn in the URL', () => {
      const data = { source: 'name', orderedSectionsToFix: ['name'] }

      const result = personalFixPresenter(data, crn)

      expect(result.backLink).toEqual(`/customer/${crn}/details`)
    })

    test('it falls back to the search page when the crn is missing', () => {
      const data = { source: 'name', orderedSectionsToFix: ['name'] }

      const result = personalFixPresenter(data, undefined)

      expect(result.backLink).toEqual('/search-crn')
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
        const result = personalFixPresenter(data, crn)

        expect(result.updateText)
          .toEqual('We will ask you to update your personal email address as well as your full name.')
      })
    })

    describe('when more than two sections need fixing and a source is provided', () => {
      beforeEach(() => {
        data = {
          source: 'address',
          orderedSectionsToFix: ['address', 'dob', 'email']
        }
      })

      test('it references the source section in the update text', () => {
        const result = personalFixPresenter(data, crn)

        expect(result.updateText)
          .toEqual('We will ask you to update these details as well as your personal address:')
      })
    })

    describe('when no source is provided', () => {
      beforeEach(() => {
        data = {
          orderedSectionsToFix: ['name', 'dob', 'email']
        }
      })

      test('it returns a generic update message', () => {
        const result = personalFixPresenter(data, crn)

        expect(result.updateText)
          .toEqual('We will ask you to update these details.')
      })
    })
  })

  describe('the "listOfErrors" property', () => {
    describe('when two sections need fixing', () => {
      beforeEach(() => {
        data = {
          source: 'name',
          orderedSectionsToFix: ['name', 'email']
        }
      })

      test('it returns an empty list', () => {
        const result = personalFixPresenter(data, crn)

        expect(result.listOfErrors).toEqual([])
      })
    })

    describe('when more than two sections need fixing', () => {
      beforeEach(() => {
        data = {
          source: 'phone',
          orderedSectionsToFix: ['email', 'phone', 'name', 'dob']
        }
      })

      test('it returns an ordered list excluding the source', () => {
        const result = personalFixPresenter(data, crn)

        expect(result.listOfErrors).toEqual([
          'full name',
          'date of birth',
          'personal email address'
        ])
      })
    })
  })
})
