// Test framework dependencies
import { describe, test, expect, beforeEach } from 'vitest'

// Thing under test
import { customerOverviewPresenter } from '../../../../src/presenters/overview/customer-overview-presenter.js'

describe('customerOverviewPresenter', () => {
  let data
  let page

  beforeEach(() => {
    data = {
      info: {
        crn: '1234567890',
        customerName: 'Jane Smith'
      },
      businesses: [
        { name: 'Beta Farming Co', sbi: '987654321' },
        { name: 'Acme Farm', sbi: '123456789' }
      ]
    }

    page = 1
  })

  describe('when provided with customer details and a page number', () => {
    test('it correctly presents the data', () => {
      const result = customerOverviewPresenter(data, page)

      expect(result).toEqual({
        customerName: 'Jane Smith',
        crn: '1234567890',
        hasBusinesses: true,
        businesses: {
          rows: [
            [
              { html: '<a href="/business/123456789" class="govuk-link govuk-link--no-visited-state">Acme Farm</a>' },
              { text: '123456789' }
            ],
            [
              { html: '<a href="/business/987654321" class="govuk-link govuk-link--no-visited-state">Beta Farming Co</a>' },
              { text: '987654321' }
            ]
          ]
        },
        pagination: {
          currentPageNumber: 1,
          numberOfPages: 1,
          showingMessage: 'Showing all 2 businesses',
          startItem: 1,
          endItem: 2,
          paginationTotal: 2
        },
        breadcrumbs: [
          {
            text: 'Search results',
            href: '/search-crn'
          }
        ]
      })
    })
  })

  describe('the "customerName" property', () => {
    describe('when the customerName property is missing', () => {
      beforeEach(() => {
        delete data.info.customerName
      })

      test('it should return customerName as an empty string', () => {
        const result = customerOverviewPresenter(data, page)

        expect(result.customerName).toEqual('')
      })
    })
  })

  describe('the "crn" property', () => {
    describe('when the crn property is missing', () => {
      beforeEach(() => {
        delete data.info.crn
      })

      test('it should return crn as an empty string', () => {
        const result = customerOverviewPresenter(data, page)

        expect(result.crn).toEqual('')
      })
    })
  })

  describe('the "hasBusinesses" property', () => {
    describe('when there are no businesses', () => {
      beforeEach(() => {
        data.businesses = []
      })

      test('it should return hasBusinesses as false', () => {
        const result = customerOverviewPresenter(data, page)

        expect(result.hasBusinesses).toEqual(false)
      })
    })

    describe('when businesses are missing', () => {
      beforeEach(() => {
        delete data.businesses
      })

      test('it should return hasBusinesses as false', () => {
        const result = customerOverviewPresenter(data, page)

        expect(result.hasBusinesses).toEqual(false)
      })
    })
  })

  describe('the "businesses" property', () => {
    describe('sorting', () => {
      test('it should return businesses sorted alphabetically by name (A to Z)', () => {
        const result = customerOverviewPresenter(data, page)

        expect(result.businesses.rows).toEqual([
          [
            { html: '<a href="/business/123456789" class="govuk-link govuk-link--no-visited-state">Acme Farm</a>' },
            { text: '123456789' }
          ],
          [
            { html: '<a href="/business/987654321" class="govuk-link govuk-link--no-visited-state">Beta Farming Co</a>' },
            { text: '987654321' }
          ]
        ])
      })

      test('it should sort case-insensitively', () => {
        data.businesses = [
          { name: 'zebra Farm', sbi: '111111111' },
          { name: 'Apple Farm', sbi: '222222222' }
        ]

        const result = customerOverviewPresenter(data, page)

        expect(result.businesses.rows).toEqual([
          [
            { html: '<a href="/business/222222222" class="govuk-link govuk-link--no-visited-state">Apple Farm</a>' },
            { text: '222222222' }
          ],
          [
            { html: '<a href="/business/111111111" class="govuk-link govuk-link--no-visited-state">zebra Farm</a>' },
            { text: '111111111' }
          ]
        ])
      })
    })

    describe('when there are no businesses', () => {
      beforeEach(() => {
        data.businesses = []
      })

      test('it should return an empty rows array', () => {
        const result = customerOverviewPresenter(data, page)

        expect(result.businesses).toEqual({ rows: [] })
      })
    })

    describe('when a business has missing name or sbi', () => {
      beforeEach(() => {
        data.businesses = [{ name: null, sbi: null }]
      })

      test('it should fall back to empty strings in the row', () => {
        const result = customerOverviewPresenter(data, page)

        expect(result.businesses.rows[0]).toEqual([
          { html: '<a href="/business/" class="govuk-link govuk-link--no-visited-state"></a>' },
          { text: '' }
        ])
      })
    })
  })

  describe('the "breadcrumbs" property', () => {
    test('it should always return the static search results breadcrumb', () => {
      const result = customerOverviewPresenter(data, page)

      expect(result.breadcrumbs).toEqual([
        {
          text: 'Search results',
          href: '/search-crn'
        }
      ])
    })
  })

  describe('page normalisation', () => {
    describe('when the page is not a valid integer', () => {
      test('it should default to page 1 when page is a string', () => {
        const result = customerOverviewPresenter(data, 'abc')

        expect(result.pagination.currentPageNumber).toEqual(1)
      })

      test('it should default to page 1 when page is a decimal', () => {
        const result = customerOverviewPresenter(data, 1.5)

        expect(result.pagination.currentPageNumber).toEqual(1)
      })

      test('it should default to page 1 when page is less than 1', () => {
        const result = customerOverviewPresenter(data, -1)

        expect(result.pagination.currentPageNumber).toEqual(1)
      })

      test('it should default to page 1 when page is 0', () => {
        const result = customerOverviewPresenter(data, 0)

        expect(result.pagination.currentPageNumber).toEqual(1)
      })
    })
  })

  describe('page clamping', () => {
    describe('when the requested page exceeds the total number of pages', () => {
      test('it should clamp to the last page', () => {
        // 2 businesses fit on 1 page, so requesting page 5 should clamp to page 1
        const result = customerOverviewPresenter(data, 5)

        expect(result.pagination.currentPageNumber).toEqual(1)
      })
    })

    describe('when there are no businesses', () => {
      beforeEach(() => {
        data.businesses = []
      })

      test('it should clamp to page 1 as the only valid page', () => {
        const result = customerOverviewPresenter(data, 3)

        expect(result.pagination.currentPageNumber).toEqual(1)
      })
    })
  })
})
