// Test framework dependencies
import { describe, test, expect } from 'vitest'

// Thing under test
import { paginationPresenter, PAGE_SIZE_DEFAULT } from '../../../src/presenters/pagination-presenter.js'

describe('paginationPresenter', () => {
  const baseUrl = '/business-overview?sbi=106705779'

  describe('when there is only one page of results', () => {
    test('it returns null when totalItems is less than pageSize', () => {
      const result = paginationPresenter({
        totalItems: 15,
        currentPage: 1,
        pageSize: 20,
        baseUrl
      })

      expect(result).toBeNull()
    })

    test('it returns null when totalItems equals pageSize', () => {
      const result = paginationPresenter({
        totalItems: 20,
        currentPage: 1,
        pageSize: 20,
        baseUrl
      })

      expect(result).toBeNull()
    })

    test('it returns null when totalItems is 0', () => {
      const result = paginationPresenter({
        totalItems: 0,
        currentPage: 1,
        pageSize: 20,
        baseUrl
      })

      expect(result).toBeNull()
    })
  })

  describe('when on the first page', () => {
    const result = paginationPresenter({
      totalItems: 60,
      currentPage: 1,
      pageSize: 20,
      baseUrl
    })

    test('it does not include a previous link', () => {
      expect(result.previous).toBeUndefined()
    })

    test('it includes a next link to page 2', () => {
      expect(result.next).toEqual({
        href: '/business-overview?sbi=106705779&page=2'
      })
    })

    test('it marks page 1 as current', () => {
      const currentItem = result.items.find((item) => item.current)

      expect(currentItem.number).toBe(1)
    })
  })

  describe('when on the last page', () => {
    const result = paginationPresenter({
      totalItems: 60,
      currentPage: 3,
      pageSize: 20,
      baseUrl
    })

    test('it includes a previous link to page 2', () => {
      expect(result.previous).toEqual({
        href: '/business-overview?sbi=106705779&page=2'
      })
    })

    test('it does not include a next link', () => {
      expect(result.next).toBeUndefined()
    })

    test('it marks the last page as current', () => {
      const currentItem = result.items.find((item) => item.current)

      expect(currentItem.number).toBe(3)
    })
  })

  describe('when on a middle page', () => {
    const result = paginationPresenter({
      totalItems: 60,
      currentPage: 2,
      pageSize: 20,
      baseUrl
    })

    test('it includes both previous and next links', () => {
      expect(result.previous).toEqual({
        href: '/business-overview?sbi=106705779&page=1'
      })
      expect(result.next).toEqual({
        href: '/business-overview?sbi=106705779&page=3'
      })
    })
  })

  describe('items array with few pages (no ellipsis needed)', () => {
    const result = paginationPresenter({
      totalItems: 60,
      currentPage: 2,
      pageSize: 20,
      baseUrl
    })

    test('it shows all page numbers without ellipsis', () => {
      const numbers = result.items.map((item) => item.number)

      expect(numbers).toEqual([1, 2, 3])
    })

    test('it does not include any ellipsis items', () => {
      const ellipses = result.items.filter((item) => item.ellipsis)

      expect(ellipses).toHaveLength(0)
    })
  })

  describe('items array with many pages (ellipsis needed)', () => {
    describe('when on page 5 of 100', () => {
      const result = paginationPresenter({
        totalItems: 2000,
        currentPage: 5,
        pageSize: 20,
        baseUrl
      })

      test('it shows first, neighbours of current, and last with ellipses', () => {
        expect(result.items).toEqual([
          { number: 1, href: '/business-overview?sbi=106705779&page=1' },
          { ellipsis: true },
          { number: 4, href: '/business-overview?sbi=106705779&page=4' },
          { number: 5, href: '/business-overview?sbi=106705779&page=5', current: true },
          { number: 6, href: '/business-overview?sbi=106705779&page=6' },
          { ellipsis: true },
          { number: 100, href: '/business-overview?sbi=106705779&page=100' }
        ])
      })
    })

    describe('when on page 1 of 100', () => {
      const result = paginationPresenter({
        totalItems: 2000,
        currentPage: 1,
        pageSize: 20,
        baseUrl
      })

      test('it shows [1] 2 ... 100', () => {
        expect(result.items).toEqual([
          { number: 1, href: '/business-overview?sbi=106705779&page=1', current: true },
          { number: 2, href: '/business-overview?sbi=106705779&page=2' },
          { ellipsis: true },
          { number: 100, href: '/business-overview?sbi=106705779&page=100' }
        ])
      })
    })

    describe('when on page 3 of 100', () => {
      const result = paginationPresenter({
        totalItems: 2000,
        currentPage: 3,
        pageSize: 20,
        baseUrl
      })

      test('it shows 1 2 [3] 4 ... 100', () => {
        expect(result.items).toEqual([
          { number: 1, href: '/business-overview?sbi=106705779&page=1' },
          { number: 2, href: '/business-overview?sbi=106705779&page=2' },
          { number: 3, href: '/business-overview?sbi=106705779&page=3', current: true },
          { number: 4, href: '/business-overview?sbi=106705779&page=4' },
          { ellipsis: true },
          { number: 100, href: '/business-overview?sbi=106705779&page=100' }
        ])
      })
    })

    describe('when on page 99 of 100', () => {
      const result = paginationPresenter({
        totalItems: 2000,
        currentPage: 99,
        pageSize: 20,
        baseUrl
      })

      test('it shows 1 ... 98 [99] 100', () => {
        expect(result.items).toEqual([
          { number: 1, href: '/business-overview?sbi=106705779&page=1' },
          { ellipsis: true },
          { number: 98, href: '/business-overview?sbi=106705779&page=98' },
          { number: 99, href: '/business-overview?sbi=106705779&page=99', current: true },
          { number: 100, href: '/business-overview?sbi=106705779&page=100' }
        ])
      })
    })

    describe('when on page 100 of 100', () => {
      const result = paginationPresenter({
        totalItems: 2000,
        currentPage: 100,
        pageSize: 20,
        baseUrl
      })

      test('it shows 1 ... 99 [100]', () => {
        expect(result.items).toEqual([
          { number: 1, href: '/business-overview?sbi=106705779&page=1' },
          { ellipsis: true },
          { number: 99, href: '/business-overview?sbi=106705779&page=99' },
          { number: 100, href: '/business-overview?sbi=106705779&page=100', current: true }
        ])
      })
    })

    describe('when on page 4 of 100 (no ellipsis between first and neighbour)', () => {
      const result = paginationPresenter({
        totalItems: 2000,
        currentPage: 4,
        pageSize: 20,
        baseUrl
      })

      test('it shows 1 2 3 [4] 5 ... 100 (no ellipsis where gap is 1)', () => {
        expect(result.items).toEqual([
          { number: 1, href: '/business-overview?sbi=106705779&page=1' },
          { ellipsis: true },
          { number: 3, href: '/business-overview?sbi=106705779&page=3' },
          { number: 4, href: '/business-overview?sbi=106705779&page=4', current: true },
          { number: 5, href: '/business-overview?sbi=106705779&page=5' },
          { ellipsis: true },
          { number: 100, href: '/business-overview?sbi=106705779&page=100' }
        ])
      })
    })
  })

  describe('the "current" property', () => {
    test('it is only set on the current page item', () => {
      const result = paginationPresenter({
        totalItems: 60,
        currentPage: 2,
        pageSize: 20,
        baseUrl
      })

      const itemsWithCurrent = result.items.filter((item) => item.current)

      expect(itemsWithCurrent).toHaveLength(1)
      expect(itemsWithCurrent[0].number).toBe(2)
    })
  })

  describe('href construction', () => {
    test('it appends page param with & when baseUrl already has query params', () => {
      const result = paginationPresenter({
        totalItems: 40,
        currentPage: 1,
        pageSize: 20,
        baseUrl: '/business-overview?sbi=123'
      })

      expect(result.next.href).toBe('/business-overview?sbi=123&page=2')
    })

    test('it appends page param with ? when baseUrl has no query params', () => {
      const result = paginationPresenter({
        totalItems: 40,
        currentPage: 1,
        pageSize: 20,
        baseUrl: '/results'
      })

      expect(result.next.href).toBe('/results?page=2')
    })
  })

  describe('default pageSize', () => {
    test('it exports PAGE_SIZE_DEFAULT as 20', () => {
      expect(PAGE_SIZE_DEFAULT).toBe(20)
    })

    test('it uses 20 as default when pageSize is not provided', () => {
      const result = paginationPresenter({
        totalItems: 21,
        currentPage: 1,
        baseUrl
      })

      expect(result).not.toBeNull()
      expect(result.next.href).toContain('page=2')
    })
  })

  describe('edge cases', () => {
    test('it clamps currentPage to 1 when given 0', () => {
      const result = paginationPresenter({
        totalItems: 40,
        currentPage: 0,
        pageSize: 20,
        baseUrl
      })

      const currentItem = result.items.find((item) => item.current)

      expect(currentItem.number).toBe(1)
    })

    test('it clamps currentPage to totalPages when given a value beyond the last page', () => {
      const result = paginationPresenter({
        totalItems: 40,
        currentPage: 99,
        pageSize: 20,
        baseUrl
      })

      const currentItem = result.items.find((item) => item.current)

      expect(currentItem.number).toBe(2)
    })
  })
})
