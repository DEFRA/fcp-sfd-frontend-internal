// Test framework dependencies
import { describe, test, expect, beforeEach } from 'vitest'

// Thing under test
import { formatAddressLines, formatBreadcrumbLabel, buildEntityBreadcrumbs } from '../../../src/presenters/base-presenter.js'
import { SEARCH_SBI, SEARCH_CRN } from '../../../src/constants/search-links.js'

describe('basePresenter', () => {
  describe('#formatAddressLines', () => {
    let address

    describe('when the address is a lookup address with pafOrganisationName', () => {
      beforeEach(() => {
        address = {
          lookup: {
            pafOrganisationName: 'Herberts Lawn Mowing Ltd',
            flatName: 'Flat 2',
            buildingName: 'The Lawn Building',
            buildingNumberRange: '14',
            street: 'Chip Lane',
            doubleDependentLocality: 'Chip Lane Area',
            dependentLocality: 'Taunton Borough',
            county: 'Somerset',
            uprn: '100012345678'
          },
          manual: {},
          city: 'Taunton',
          postcode: 'TA1 1AA',
          country: 'England'
        }
      })

      test('it should return the formatted address lines and postcode', () => {
        const result = formatAddressLines(address)

        expect(result).toEqual({
          addressLines: 'Herberts Lawn Mowing Ltd, Flat 2, The Lawn Building, 14 Chip Lane, Chip Lane Area, Taunton Borough, Taunton, Somerset, England',
          postcode: 'TA1 1AA'
        })
      })
    })

    describe('when the address is a lookup address without pafOrganisationName', () => {
      beforeEach(() => {
        address = {
          lookup: {
            flatName: 'Flat 1',
            buildingName: 'The Farm House',
            buildingNumberRange: '12',
            street: 'Farm Lane',
            doubleDependentLocality: 'Rural Area',
            dependentLocality: 'West Fields',
            county: 'Devon',
            uprn: '200023456789'
          },
          manual: {},
          city: 'Exeter',
          postcode: 'EX1 1AA',
          country: 'England'
        }
      })

      test('it should return the formatted address lines and postcode without an organisation name', () => {
        const result = formatAddressLines(address)

        expect(result).toEqual({
          addressLines: 'Flat 1, The Farm House, 12 Farm Lane, Rural Area, West Fields, Exeter, Devon, England',
          postcode: 'EX1 1AA'
        })
      })
    })

    describe('when the address is manually entered', () => {
      beforeEach(() => {
        address = {
          lookup: { uprn: null },
          manual: {
            line1: '12 Farm Lane',
            line2: 'West Fields',
            line3: null,
            line4: 'Devon',
            line5: null
          },
          city: 'Exeter',
          postcode: 'EX1 1AA',
          country: 'England'
        }
      })

      test('it should return the formatted address lines from manual fields', () => {
        const result = formatAddressLines(address)

        expect(result).toEqual({
          addressLines: '12 Farm Lane, West Fields, Exeter, Devon, England',
          postcode: 'EX1 1AA'
        })
      })
    })

    describe('when the address is null', () => {
      test('it should return empty strings for both addressLines and postcode', () => {
        const result = formatAddressLines(null)

        expect(result).toEqual({
          addressLines: '',
          postcode: ''
        })
      })
    })

    describe('when the address is undefined', () => {
      test('it should return empty strings for both addressLines and postcode', () => {
        const result = formatAddressLines(undefined)

        expect(result).toEqual({
          addressLines: '',
          postcode: ''
        })
      })
    })

    describe('when some optional lookup fields are missing', () => {
      beforeEach(() => {
        address = {
          lookup: {
            buildingNumberRange: '10',
            street: 'Main Street',
            uprn: '300000000001'
          },
          manual: {},
          city: 'Bristol',
          postcode: 'BS1 1AA',
          country: 'England'
        }
      })

      test('it should omit the missing fields from the address lines', () => {
        const result = formatAddressLines(address)

        expect(result).toEqual({
          addressLines: '10 Main Street, Bristol, England',
          postcode: 'BS1 1AA'
        })
      })
    })
  })

  describe('#formatBreadcrumbLabel', () => {
    describe('when a name is provided', () => {
      test('it should return the name followed by the id label and id in brackets', () => {
        const result = formatBreadcrumbLabel('Herberts Lawn Mowing', 'SBI', '106705779')

        expect(result).toBe('Herberts Lawn Mowing (SBI: 106705779)')
      })
    })

    describe('when no name is provided', () => {
      test('it should fall back to just the id label and id', () => {
        const result = formatBreadcrumbLabel('', 'CRN', '1101996862')

        expect(result).toBe('CRN: 1101996862')
      })
    })

    describe('when the name is null', () => {
      test('it should fall back to just the id label and id', () => {
        const result = formatBreadcrumbLabel(null, 'SBI', '106705779')

        expect(result).toBe('SBI: 106705779')
      })
    })
  })

  describe('#buildEntityBreadcrumbs', () => {
    describe('when there is no id', () => {
      test('it should return only the search results crumb, linking to the search path', () => {
        const result = buildEntityBreadcrumbs('sbi', null, 'Herberts Lawn Mowing')

        expect(result).toEqual([{ text: 'Search results', href: SEARCH_SBI }])
      })
    })

    describe('when the queryKey is "sbi"', () => {
      test('it should use the SBI search path and label', () => {
        const result = buildEntityBreadcrumbs('sbi', '106705779', 'Herberts Lawn Mowing')

        expect(result).toEqual([
          { text: 'Search results', href: `${SEARCH_SBI}?sbi=106705779` },
          { text: 'Herberts Lawn Mowing (SBI: 106705779)' }
        ])
      })
    })

    describe('when the queryKey is "crn"', () => {
      test('it should use the CRN search path and label', () => {
        const result = buildEntityBreadcrumbs('crn', '1101996862', 'Alfred Waldron')

        expect(result).toEqual([
          { text: 'Search results', href: `${SEARCH_CRN}?crn=1101996862` },
          { text: 'Alfred Waldron (CRN: 1101996862)' }
        ])
      })
    })

    describe('when a currentHref is provided', () => {
      test('it should add it to the current page crumb', () => {
        const result = buildEntityBreadcrumbs('sbi', '106705779', 'Herberts Lawn Mowing', '/business/106705779')

        expect(result[1]).toEqual({ text: 'Herberts Lawn Mowing (SBI: 106705779)', href: '/business/106705779' })
      })
    })

    describe('when no currentHref is provided', () => {
      test('it should omit the href from the current page crumb', () => {
        const result = buildEntityBreadcrumbs('sbi', '106705779', 'Herberts Lawn Mowing')

        expect(result[1]).not.toHaveProperty('href')
      })
    })

    describe('when no name is provided', () => {
      test('it should fall back to just the id label and id in the current page crumb', () => {
        const result = buildEntityBreadcrumbs('sbi', '106705779', null)

        expect(result[1]).toEqual({ text: 'SBI: 106705779' })
      })
    })
  })
})
