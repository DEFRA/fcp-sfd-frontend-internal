// Test framework dependencies
import { describe, test, expect, beforeEach } from 'vitest'

// Thing under test
import { businessOverviewPresenter } from '../../../../src/presenters/overview/business-overview-presenter.js'

describe('businessOverviewPresenter', () => {
  let data
  let page

  beforeEach(() => {
    data = {
      sbi: '106705779',
      businessName: 'Herberts Lawn Mowing',
      customers: [
        { crn: '1100000001', firstName: 'Alice', lastName: 'Smith' },
        { crn: '1100000002', firstName: 'Bob', lastName: 'Jones' },
        { crn: '1100000003', firstName: 'Charlie', lastName: 'Brown' }
      ]
    }

    page = 1
  })

  describe('when provided with business overview data and a page number', () => {
    test('it correctly presents the data', () => {
      const result = businessOverviewPresenter(data, page)

      expect(result).toEqual({
        pageTitle: 'Business overview',
        sbi: '106705779',
        businessName: 'Herberts Lawn Mowing',
        hasCustomers: true,
        customers: {
          rows: [
            [
              { html: '<a href="/customer/1100000001" class="govuk-link govuk-link--no-visited-state">Alice Smith</a>' },
              { text: '1100000001' }
            ],
            [
              { html: '<a href="/customer/1100000002" class="govuk-link govuk-link--no-visited-state">Bob Jones</a>' },
              { text: '1100000002' }
            ],
            [
              { html: '<a href="/customer/1100000003" class="govuk-link govuk-link--no-visited-state">Charlie Brown</a>' },
              { text: '1100000003' }
            ]
          ]
        },
        pagination: {
          currentPageNumber: 1,
          numberOfPages: 1,
          showingMessage: 'Showing all 3 customers',
          startItem: 1,
          endItem: 3,
          paginationTotal: 3
        },
        breadcrumbs: [
          {
            text: 'Search results',
            href: '/search-sbi'
          }
        ]
      })
    })
  })

  describe('the "sbi" property', () => {
    describe('when the sbi property is missing', () => {
      beforeEach(() => {
        delete data.sbi
      })

      test('it should return sbi as an empty string', () => {
        const result = businessOverviewPresenter(data, page)

        expect(result.sbi).toEqual('')
      })
    })
  })

  describe('the "businessName" property', () => {
    describe('when the businessName property is missing', () => {
      beforeEach(() => {
        delete data.businessName
      })

      test('it should return businessName as an empty string', () => {
        const result = businessOverviewPresenter(data, page)

        expect(result.businessName).toEqual('')
      })
    })
  })

  describe('the "hasCustomers" property', () => {
    describe('when there are no customers', () => {
      beforeEach(() => {
        data.customers = []
      })

      test('it should return hasCustomers as false', () => {
        const result = businessOverviewPresenter(data, page)

        expect(result.hasCustomers).toEqual(false)
      })
    })

    describe('when customers are missing', () => {
      beforeEach(() => {
        delete data.customers
      })

      test('it should return hasCustomers as false', () => {
        const result = businessOverviewPresenter(data, page)

        expect(result.hasCustomers).toEqual(false)
      })
    })
  })

  describe('the "customers" property', () => {
    describe('sorting', () => {
      test('it should return customers sorted alphabetically by full name (A to Z)', () => {
        const result = businessOverviewPresenter(data, page)

        expect(result.customers.rows).toEqual([
          [
            { html: '<a href="/customer/1100000001" class="govuk-link govuk-link--no-visited-state">Alice Smith</a>' },
            { text: '1100000001' }
          ],
          [
            { html: '<a href="/customer/1100000002" class="govuk-link govuk-link--no-visited-state">Bob Jones</a>' },
            { text: '1100000002' }
          ],
          [
            { html: '<a href="/customer/1100000003" class="govuk-link govuk-link--no-visited-state">Charlie Brown</a>' },
            { text: '1100000003' }
          ]
        ])
      })

      test('it should sort case-insensitively', () => {
        data.customers = [
          { crn: '1100000001', firstName: 'zebra', lastName: 'Farmer' },
          { crn: '1100000002', firstName: 'Apple', lastName: 'Grower' }
        ]

        const result = businessOverviewPresenter(data, page)

        expect(result.customers.rows).toEqual([
          [
            { html: '<a href="/customer/1100000002" class="govuk-link govuk-link--no-visited-state">Apple Grower</a>' },
            { text: '1100000002' }
          ],
          [
            { html: '<a href="/customer/1100000001" class="govuk-link govuk-link--no-visited-state">zebra Farmer</a>' },
            { text: '1100000001' }
          ]
        ])
      })
    })

    describe('when there are no customers', () => {
      beforeEach(() => {
        data.customers = []
      })

      test('it should return an empty rows array', () => {
        const result = businessOverviewPresenter(data, page)

        expect(result.customers).toEqual({ rows: [] })
      })
    })

    describe('when a customer has missing firstName, lastName, or crn', () => {
      beforeEach(() => {
        data.customers = [{ crn: null, firstName: null, lastName: null }]
      })

      test('it should fall back to empty strings in the row', () => {
        const result = businessOverviewPresenter(data, page)

        expect(result.customers.rows[0]).toEqual([
          { html: '<a href="/customer/" class="govuk-link govuk-link--no-visited-state"></a>' },
          { text: '' }
        ])
      })
    })

    describe('when a customer name contains special HTML characters', () => {
      test('it should escape HTML special characters in the customer name', () => {
        data.customers = [
          { crn: '1100000001', firstName: 'Tom & Jerry <script>alert("xss")</script>', lastName: 'Farmer' }
        ]

        const result = businessOverviewPresenter(data, page)

        expect(result.customers.rows[0]).toEqual([
          { html: '<a href="/customer/1100000001" class="govuk-link govuk-link--no-visited-state">Tom &amp; Jerry &lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt; Farmer</a>' },
          { text: '1100000001' }
        ])
      })

      test('it should escape single quotes in the customer name', () => {
        data.customers = [
          { crn: '1100000001', firstName: "O'Malley", lastName: "O'Brien" }
        ]

        const result = businessOverviewPresenter(data, page)

        expect(result.customers.rows[0]).toEqual([
          { html: '<a href="/customer/1100000001" class="govuk-link govuk-link--no-visited-state">O&#39;Malley O&#39;Brien</a>' },
          { text: '1100000001' }
        ])
      })
    })
  })

  describe('the "breadcrumbs" property', () => {
    test('it should always return the static search results breadcrumb', () => {
      const result = businessOverviewPresenter(data, page)

      expect(result.breadcrumbs).toEqual([
        {
          text: 'Search results',
          href: '/search-sbi'
        }
      ])
    })
  })

  describe('page normalisation', () => {
    describe('when the page is not a valid integer', () => {
      test('it should default to page 1 when page is a string', () => {
        const result = businessOverviewPresenter(data, 'abc')

        expect(result.pagination.currentPageNumber).toEqual(1)
      })

      test('it should default to page 1 when page is a decimal', () => {
        const result = businessOverviewPresenter(data, 1.5)

        expect(result.pagination.currentPageNumber).toEqual(1)
      })

      test('it should default to page 1 when page is less than 1', () => {
        const result = businessOverviewPresenter(data, -1)

        expect(result.pagination.currentPageNumber).toEqual(1)
      })

      test('it should default to page 1 when page is 0', () => {
        const result = businessOverviewPresenter(data, 0)

        expect(result.pagination.currentPageNumber).toEqual(1)
      })
    })
  })

  describe('page clamping', () => {
    describe('when the requested page exceeds the total number of pages', () => {
      test('it should clamp to the last page', () => {
        // 3 customers fit on 1 page, so requesting page 5 should clamp to page 1
        const result = businessOverviewPresenter(data, 5)

        expect(result.pagination.currentPageNumber).toEqual(1)
      })
    })

    describe('when there are no customers', () => {
      beforeEach(() => {
        data.customers = []
      })

      test('it should clamp to page 1 as the only valid page', () => {
        const result = businessOverviewPresenter(data, 3)

        expect(result.pagination.currentPageNumber).toEqual(1)
      })
    })
  })
})
