// Test framework dependencies
import { describe, test, expect, beforeEach } from 'vitest'

// Thing under test
import { paginationPresenter } from '../../../src/presenters/pagination-presenter.js'

describe('Paginator Presenter', () => {
  const path = '/search-sbi'

// We set the number of records to match the default page size used in these tests (20), so we get the expected number of pages
  // to pages we expect
  let numberOfRecords
  let queryArgs
  let selectedPage
  let currentAmount
  let message

  beforeEach(async () => {
    // Use the default page size (20), as this is what the queries return
    currentAmount = 20
    message = 'businesses'
  })

  describe('when no pagination is needed', () => {
    describe('for 1 page', () => {
      beforeEach(() => {
        numberOfRecords = 1
      })

      test('returns just the number of pages calculated (no pagination component returned)', () => {
        const result = paginationPresenter(numberOfRecords, selectedPage, path, currentAmount, message)

        expect(result).toMatchObject({
          currentPageNumber: 1,
          numberOfPages: 1,
          showingMessage: 'Showing all 1 businesses'
        })
      })

      test('returns the "Showing all X <message>" message', () => {
        const result = paginationPresenter(numberOfRecords, selectedPage, path, currentAmount, message)

        expect(result.showingMessage).toEqual('Showing all 1 businesses')
      })
    })
  })

  describe('when pagination is needed', () => {
    describe('and there are no query arguments', () => {
      describe('for 2 pages', () => {
        beforeEach(() => {
          numberOfRecords = 35
        })

        describe('and the first page is selected', () => {
          beforeEach(() => {
            selectedPage = 1
          })

          test('returns [1] 2 Next ->', () => {
            const result = paginationPresenter(numberOfRecords, selectedPage, path, currentAmount, message)

            expect(result).toMatchObject({
              currentPageNumber: selectedPage,
              numberOfPages: 2,
              component: {
                items: [
                  { href: '/search-sbi?page=1', current: true },
                  { href: '/search-sbi?page=2', current: false }
                ],
                next: { href: '/search-sbi?page=2' }
              }
            })
          })
        })

        describe('and the last page is selected', () => {
          beforeEach(() => {
            selectedPage = 2
          })

          test('returns <- Previous 1 [2]', () => {
            const result = paginationPresenter(numberOfRecords, selectedPage, path, currentAmount, message)

            expect(result).toMatchObject({
              currentPageNumber: selectedPage,
              numberOfPages: 2,
              component: {
                items: [
                  { href: '/search-sbi?page=1', current: false },
                  { href: '/search-sbi?page=2', current: true }
                ],
                previous: { href: '/search-sbi?page=1' }
              }
            })
          })
        })
      })

      describe('for 3 pages', () => {
        beforeEach(() => {
          numberOfRecords = 55
        })

        describe('and the first page is selected', () => {
          beforeEach(() => {
            selectedPage = 1
          })

          test('returns [1] 2  3 Next ->', () => {
            const result = paginationPresenter(numberOfRecords, selectedPage, path, currentAmount, message)

            expect(result).toMatchObject({
              currentPageNumber: selectedPage,
              numberOfPages: 3,
              component: {
                items: [
                  { href: '/search-sbi?page=1', current: true },
                  { href: '/search-sbi?page=2', current: false },
                  { href: '/search-sbi?page=3', current: false }
                ],
                next: { href: '/search-sbi?page=2' }
              }
            })
          })
        })

        describe('and page 2 is selected', () => {
          beforeEach(() => {
            selectedPage = 2
          })

          test('returns <- Previous 1 [2] 3 Next ->', () => {
            const result = paginationPresenter(numberOfRecords, selectedPage, path, currentAmount, message)

            expect(result).toMatchObject({
              currentPageNumber: selectedPage,
              numberOfPages: 3,
              component: {
                items: [
                  { href: '/search-sbi?page=1', current: false },
                  { href: '/search-sbi?page=2', current: true },
                  { href: '/search-sbi?page=3', current: false }
                ],
                next: { href: '/search-sbi?page=3' },
                previous: { href: '/search-sbi?page=1' }
              }
            })
          })
        })

        describe('and the last page is selected', () => {
          beforeEach(() => {
            selectedPage = 3
          })

          test('returns <- Previous 1 2 [3]', () => {
            const result = paginationPresenter(numberOfRecords, selectedPage, path, currentAmount, message)

            expect(result).toMatchObject({
              currentPageNumber: selectedPage,
              numberOfPages: 3,
              component: {
                items: [
                  { href: '/search-sbi?page=1', current: false },
                  { href: '/search-sbi?page=2', current: false },
                  { href: '/search-sbi?page=3', current: true }
                ],
                previous: { href: '/search-sbi?page=2' }
              }
            })
          })
        })
      })

      describe('for 4 pages', () => {
        beforeEach(() => {
          numberOfRecords = 75
        })

        describe('and the first page is selected', () => {
          beforeEach(() => {
            selectedPage = 1
          })

          test('returns [1] 2 3 4 Next ->', () => {
            const result = paginationPresenter(numberOfRecords, selectedPage, path, currentAmount, message)

            expect(result).toMatchObject({
              currentPageNumber: selectedPage,
              numberOfPages: 4,
              component: {
                items: [
                  { href: '/search-sbi?page=1', current: true },
                  { href: '/search-sbi?page=2', current: false },
                  { href: '/search-sbi?page=3', current: false },
                  { href: '/search-sbi?page=4', current: false }
                ],
                next: { href: '/search-sbi?page=2' }
              }
            })
          })
        })

        describe('and page 2 is selected', () => {
          beforeEach(() => {
            selectedPage = 2
          })

          test('returns <- Previous 1 [2] 3 4 Next ->', () => {
            const result = paginationPresenter(numberOfRecords, selectedPage, path, currentAmount, message)

            expect(result).toMatchObject({
              currentPageNumber: selectedPage,
              numberOfPages: 4,
              component: {
                items: [
                  { href: '/search-sbi?page=1', current: false },
                  { href: '/search-sbi?page=2', current: true },
                  { href: '/search-sbi?page=3', current: false },
                  { href: '/search-sbi?page=4', current: false }
                ],
                next: { href: '/search-sbi?page=3' },
                previous: { href: '/search-sbi?page=1' }
              }
            })
          })
        })

        describe('and the last page is selected', () => {
          beforeEach(() => {
            selectedPage = 4
          })

          test('returns <- Previous 1 2 3 [4]', () => {
            const result = paginationPresenter(numberOfRecords, selectedPage, path, currentAmount, message)

            expect(result).toMatchObject({
              currentPageNumber: selectedPage,
              numberOfPages: 4,
              component: {
                items: [
                  { href: '/search-sbi?page=1', current: false },
                  { href: '/search-sbi?page=2', current: false },
                  { href: '/search-sbi?page=3', current: false },
                  { href: '/search-sbi?page=4', current: true }
                ],
                previous: { href: '/search-sbi?page=3' }
              }
            })
          })
        })
      })

      describe('for 5 pages', () => {
        beforeEach(() => {
          numberOfRecords = 95
        })

        describe('and the first page is selected', () => {
          beforeEach(() => {
            selectedPage = 1
          })

          test('returns [1] 2 3 4 5 Next ->', () => {
            const result = paginationPresenter(numberOfRecords, selectedPage, path, currentAmount, message)

            expect(result).toMatchObject({
              currentPageNumber: selectedPage,
              numberOfPages: 5,
              component: {
                items: [
                  { href: '/search-sbi?page=1', current: true },
                  { href: '/search-sbi?page=2', current: false },
                  { href: '/search-sbi?page=3', current: false },
                  { href: '/search-sbi?page=4', current: false },
                  { href: '/search-sbi?page=5', current: false }
                ],
                next: { href: '/search-sbi?page=2' }
              }
            })
          })
        })

        describe('and page 3 is selected', () => {
          beforeEach(() => {
            selectedPage = 3
          })

          test('returns <- Previous 1 2 [3] 4 5 Next ->', () => {
            const result = paginationPresenter(numberOfRecords, selectedPage, path, currentAmount, message)

            expect(result).toMatchObject({
              currentPageNumber: selectedPage,
              numberOfPages: 5,
              component: {
                items: [
                  { href: '/search-sbi?page=1', current: false },
                  { href: '/search-sbi?page=2', current: false },
                  { href: '/search-sbi?page=3', current: true },
                  { href: '/search-sbi?page=4', current: false },
                  { href: '/search-sbi?page=5', current: false }
                ],
                next: { href: '/search-sbi?page=4' },
                previous: { href: '/search-sbi?page=2' }
              }
            })
          })
        })

        describe('and the last page is selected', () => {
          beforeEach(() => {
            selectedPage = 5
          })

          test('returns <- Previous 1 2 3 4 [5]', () => {
            const result = paginationPresenter(numberOfRecords, selectedPage, path, currentAmount, message)

            expect(result).toMatchObject({
              currentPageNumber: selectedPage,
              numberOfPages: 5,
              component: {
                items: [
                  { href: '/search-sbi?page=1', current: false },
                  { href: '/search-sbi?page=2', current: false },
                  { href: '/search-sbi?page=3', current: false },
                  { href: '/search-sbi?page=4', current: false },
                  { href: '/search-sbi?page=5', current: true }
                ],
                previous: { href: '/search-sbi?page=4' }
              }
            })
          })
        })
      })

      describe('for 6 pages', () => {
        beforeEach(() => {
          numberOfRecords = 115
        })

        describe('and the first page is selected', () => {
          beforeEach(() => {
            selectedPage = 1
          })

          test('returns [1] 2 3 4 5 6 Next ->', () => {
            const result = paginationPresenter(numberOfRecords, selectedPage, path, currentAmount, message)

            expect(result).toMatchObject({
              currentPageNumber: selectedPage,
              numberOfPages: 6,
              component: {
                items: [
                  { href: '/search-sbi?page=1', current: true },
                  { href: '/search-sbi?page=2', current: false },
                  { href: '/search-sbi?page=3', current: false },
                  { href: '/search-sbi?page=4', current: false },
                  { href: '/search-sbi?page=5', current: false },
                  { href: '/search-sbi?page=6', current: false }
                ],
                next: { href: '/search-sbi?page=2' }
              }
            })
          })
        })

        describe('and page 3 is selected', () => {
          beforeEach(() => {
            selectedPage = 3
          })

          test('returns <- Previous 1 2 [3] 4 5 6 Next ->', () => {
            const result = paginationPresenter(numberOfRecords, selectedPage, path, currentAmount, message)

            expect(result).toMatchObject({
              currentPageNumber: selectedPage,
              numberOfPages: 6,
              component: {
                items: [
                  { href: '/search-sbi?page=1', current: false },
                  { href: '/search-sbi?page=2', current: false },
                  { href: '/search-sbi?page=3', current: true },
                  { href: '/search-sbi?page=4', current: false },
                  { href: '/search-sbi?page=5', current: false },
                  { href: '/search-sbi?page=6', current: false }
                ],
                next: { href: '/search-sbi?page=4' },
                previous: { href: '/search-sbi?page=2' }
              }
            })
          })
        })

        describe('and the last page is selected', () => {
          beforeEach(() => {
            selectedPage = 6
          })

          test('returns <- Previous 1 2 3 4 5 [6]', () => {
            const result = paginationPresenter(numberOfRecords, selectedPage, path, currentAmount, message)

            expect(result).toMatchObject({
              currentPageNumber: selectedPage,
              numberOfPages: 6,
              component: {
                items: [
                  { href: '/search-sbi?page=1', current: false },
                  { href: '/search-sbi?page=2', current: false },
                  { href: '/search-sbi?page=3', current: false },
                  { href: '/search-sbi?page=4', current: false },
                  { href: '/search-sbi?page=5', current: false },
                  { href: '/search-sbi?page=6', current: true }
                ],
                previous: { href: '/search-sbi?page=5' }
              }
            })
          })
        })
      })

      describe('for 7 pages', () => {
        beforeEach(() => {
          numberOfRecords = 135
        })

        describe('and the first page is selected', () => {
          beforeEach(() => {
            selectedPage = 1
          })

          test('returns [1] 2 3 4 5 6 7 Next ->', () => {
            const result = paginationPresenter(numberOfRecords, selectedPage, path, currentAmount, message)

            expect(result).toMatchObject({
              currentPageNumber: selectedPage,
              numberOfPages: 7,
              component: {
                items: [
                  { href: '/search-sbi?page=1', current: true },
                  { href: '/search-sbi?page=2', current: false },
                  { href: '/search-sbi?page=3', current: false },
                  { href: '/search-sbi?page=4', current: false },
                  { href: '/search-sbi?page=5', current: false },
                  { href: '/search-sbi?page=6', current: false },
                  { href: '/search-sbi?page=7', current: false }
                ],
                next: { href: '/search-sbi?page=2' }
              }
            })
          })
        })

        describe('and page 4 is selected', () => {
          beforeEach(() => {
            selectedPage = 4
          })

          test('returns <- Previous 1 2 3 [4] 5 6 7 Next ->', () => {
            const result = paginationPresenter(numberOfRecords, selectedPage, path, currentAmount, message)

            expect(result).toMatchObject({
              currentPageNumber: selectedPage,
              numberOfPages: 7,
              component: {
                items: [
                  { href: '/search-sbi?page=1', current: false },
                  { href: '/search-sbi?page=2', current: false },
                  { href: '/search-sbi?page=3', current: false },
                  { href: '/search-sbi?page=4', current: true },
                  { href: '/search-sbi?page=5', current: false },
                  { href: '/search-sbi?page=6', current: false },
                  { href: '/search-sbi?page=7', current: false }
                ],
                next: { href: '/search-sbi?page=5' },
                previous: { href: '/search-sbi?page=3' }
              }
            })
          })
        })

        describe('and the last page is selected', () => {
          beforeEach(() => {
            selectedPage = 7
          })

          test('returns <- Previous 1 2 3 4 5 6 [7]', () => {
            const result = paginationPresenter(numberOfRecords, selectedPage, path, currentAmount, message)

            expect(result).toMatchObject({
              currentPageNumber: selectedPage,
              numberOfPages: 7,
              component: {
                items: [
                  { href: '/search-sbi?page=1', current: false },
                  { href: '/search-sbi?page=2', current: false },
                  { href: '/search-sbi?page=3', current: false },
                  { href: '/search-sbi?page=4', current: false },
                  { href: '/search-sbi?page=5', current: false },
                  { href: '/search-sbi?page=6', current: false },
                  { href: '/search-sbi?page=7', current: true }
                ],
                previous: { href: '/search-sbi?page=6' }
              }
            })
          })
        })
      })

      describe('for 8 pages', () => {
        beforeEach(() => {
          numberOfRecords = 155
        })

        describe('and the first page is selected', () => {
          beforeEach(() => {
            selectedPage = 1
          })

          test('returns [1] 2 3 4 5 .. 8 Next ->', () => {
            const result = paginationPresenter(numberOfRecords, selectedPage, path, currentAmount, message)

            expect(result).toMatchObject({
              currentPageNumber: selectedPage,
              numberOfPages: 8,
              component: {
                items: [
                  { href: '/search-sbi?page=1', current: true },
                  { href: '/search-sbi?page=2', current: false },
                  { href: '/search-sbi?page=3', current: false },
                  { href: '/search-sbi?page=4', current: false },
                  { href: '/search-sbi?page=5', current: false },
                  { ellipsis: true },
                  { href: '/search-sbi?page=8', current: false }
                ],
                next: { href: '/search-sbi?page=2' }
              }
            })
          })
        })

        describe('and page 4 is selected', () => {
          beforeEach(() => {
            selectedPage = 4
          })

          test('returns <- Previous 1 2 3 [4] 5 .. 8 Next ->', () => {
            const result = paginationPresenter(numberOfRecords, selectedPage, path, currentAmount, message)

            expect(result).toMatchObject({
              currentPageNumber: selectedPage,
              numberOfPages: 8,
              component: {
                items: [
                  { href: '/search-sbi?page=1', current: false },
                  { href: '/search-sbi?page=2', current: false },
                  { href: '/search-sbi?page=3', current: false },
                  { href: '/search-sbi?page=4', current: true },
                  { href: '/search-sbi?page=5', current: false },
                  { ellipsis: true },
                  { href: '/search-sbi?page=8', current: false }
                ],
                next: { href: '/search-sbi?page=5' },
                previous: { href: '/search-sbi?page=3' }
              }
            })
          })
        })

        describe('and page 5 is selected', () => {
          beforeEach(() => {
            selectedPage = 5
          })

          test('returns <- Previous 1 .. 4 [5] 6 7 8 Next ->', () => {
            const result = paginationPresenter(numberOfRecords, selectedPage, path, currentAmount, message)

            expect(result).toMatchObject({
              currentPageNumber: selectedPage,
              numberOfPages: 8,
              component: {
                items: [
                  { href: '/search-sbi?page=1', current: false },
                  { ellipsis: true },
                  { href: '/search-sbi?page=4', current: false },
                  { href: '/search-sbi?page=5', current: true },
                  { href: '/search-sbi?page=6', current: false },
                  { href: '/search-sbi?page=7', current: false },
                  { href: '/search-sbi?page=8', current: false }
                ],
                next: { href: '/search-sbi?page=6' },
                previous: { href: '/search-sbi?page=4' }
              }
            })
          })
        })

        describe('and the last page is selected', () => {
          beforeEach(() => {
            selectedPage = 8
          })

          test('returns <- Previous 1 .. 4 5 6 7 [8]', () => {
            const result = paginationPresenter(numberOfRecords, selectedPage, path, currentAmount, message)

            expect(result).toMatchObject({
              currentPageNumber: selectedPage,
              numberOfPages: 8,
              component: {
                items: [
                  { href: '/search-sbi?page=1', current: false },
                  { ellipsis: true },
                  { href: '/search-sbi?page=4', current: false },
                  { href: '/search-sbi?page=5', current: false },
                  { href: '/search-sbi?page=6', current: false },
                  { href: '/search-sbi?page=7', current: false },
                  { href: '/search-sbi?page=8', current: true }
                ],
                previous: { href: '/search-sbi?page=7' }
              }
            })
          })
        })
      })

      describe('for 9 pages', () => {
        beforeEach(() => {
          numberOfRecords = 175
        })

        describe('and the first page is selected', () => {
          beforeEach(() => {
            selectedPage = 1
          })

          test('returns [1] 2 3 4 5 .. 9 Next ->', () => {
            const result = paginationPresenter(numberOfRecords, selectedPage, path, currentAmount, message)

            expect(result).toMatchObject({
              currentPageNumber: selectedPage,
              numberOfPages: 9,
              component: {
                items: [
                  { href: '/search-sbi?page=1', current: true },
                  { href: '/search-sbi?page=2', current: false },
                  { href: '/search-sbi?page=3', current: false },
                  { href: '/search-sbi?page=4', current: false },
                  { href: '/search-sbi?page=5', current: false },
                  { ellipsis: true },
                  { href: '/search-sbi?page=9', current: false }
                ],
                next: { href: '/search-sbi?page=2' }
              }
            })
          })
        })

        describe('and page 4 is selected', () => {
          beforeEach(() => {
            selectedPage = 4
          })

          test('returns <- Previous 1 2 3 [4] 5 .. 9 Next ->', () => {
            const result = paginationPresenter(numberOfRecords, selectedPage, path, currentAmount, message)

            expect(result).toMatchObject({
              currentPageNumber: selectedPage,
              numberOfPages: 9,
              component: {
                items: [
                  { href: '/search-sbi?page=1', current: false },
                  { href: '/search-sbi?page=2', current: false },
                  { href: '/search-sbi?page=3', current: false },
                  { href: '/search-sbi?page=4', current: true },
                  { href: '/search-sbi?page=5', current: false },
                  { ellipsis: true },
                  { href: '/search-sbi?page=9', current: false }
                ],
                next: { href: '/search-sbi?page=5' },
                previous: { href: '/search-sbi?page=3' }
              }
            })
          })
        })

        describe('and page 5 is selected', () => {
          beforeEach(() => {
            selectedPage = 5
          })

          test('returns <- Previous 1 .. 4 [5] 6 .. 9 Next ->', () => {
            const result = paginationPresenter(numberOfRecords, selectedPage, path, currentAmount, message)

            expect(result).toMatchObject({
              currentPageNumber: selectedPage,
              numberOfPages: 9,
              component: {
                items: [
                  { href: '/search-sbi?page=1', current: false },
                  { ellipsis: true },
                  { href: '/search-sbi?page=4', current: false },
                  { href: '/search-sbi?page=5', current: true },
                  { href: '/search-sbi?page=6', current: false },
                  { ellipsis: true },
                  { href: '/search-sbi?page=9', current: false }
                ],
                next: { href: '/search-sbi?page=6' },
                previous: { href: '/search-sbi?page=4' }
              }
            })
          })
        })

        describe('and page 6 is selected', () => {
          beforeEach(() => {
            selectedPage = 6
          })

          test('returns <- Previous 1 .. 5 [6] 7 8 9 Next ->', () => {
            const result = paginationPresenter(numberOfRecords, selectedPage, path, currentAmount, message)

            expect(result).toMatchObject({
              currentPageNumber: selectedPage,
              numberOfPages: 9,
              component: {
                items: [
                  { href: '/search-sbi?page=1', current: false },
                  { ellipsis: true },
                  { href: '/search-sbi?page=5', current: false },
                  { href: '/search-sbi?page=6', current: true },
                  { href: '/search-sbi?page=7', current: false },
                  { href: '/search-sbi?page=8', current: false },
                  { href: '/search-sbi?page=9', current: false }
                ],
                next: { href: '/search-sbi?page=7' },
                previous: { href: '/search-sbi?page=5' }
              }
            })
          })
        })

        describe('and the last page is selected', () => {
          beforeEach(() => {
            selectedPage = 9
          })

          test('returns <- Previous 1 .. 5 6 7 8 [9]', () => {
            const result = paginationPresenter(numberOfRecords, selectedPage, path, currentAmount, message)

            expect(result).toMatchObject({
              currentPageNumber: selectedPage,
              numberOfPages: 9,
              component: {
                items: [
                  { href: '/search-sbi?page=1', current: false },
                  { ellipsis: true },
                  { href: '/search-sbi?page=5', current: false },
                  { href: '/search-sbi?page=6', current: false },
                  { href: '/search-sbi?page=7', current: false },
                  { href: '/search-sbi?page=8', current: false },
                  { href: '/search-sbi?page=9', current: true }
                ],
                previous: { href: '/search-sbi?page=8' }
              }
            })
          })
        })
      })

      describe('for 100 pages', () => {
        beforeEach(() => {
          numberOfRecords = 1995
        })

        describe('and the first page is selected', () => {
          beforeEach(() => {
            selectedPage = 1
          })

          test('returns [1] 2 3 4 5 .. 100 Next ->', () => {
            const result = paginationPresenter(numberOfRecords, selectedPage, path, currentAmount, message)

            expect(result).toMatchObject({
              currentPageNumber: selectedPage,
              numberOfPages: 100,
              component: {
                items: [
                  { href: '/search-sbi?page=1', current: true },
                  { href: '/search-sbi?page=2', current: false },
                  { href: '/search-sbi?page=3', current: false },
                  { href: '/search-sbi?page=4', current: false },
                  { href: '/search-sbi?page=5', current: false },
                  { ellipsis: true },
                  { href: '/search-sbi?page=100', current: false }
                ],
                next: { href: '/search-sbi?page=2' }
              }
            })
          })
        })

        describe('and page 4 is selected', () => {
          beforeEach(() => {
            selectedPage = 4
          })

          test('returns <- Previous 1 2 3 [4] 5 .. 100 Next ->', () => {
            const result = paginationPresenter(numberOfRecords, selectedPage, path, currentAmount, message)

            expect(result).toMatchObject({
              currentPageNumber: selectedPage,
              numberOfPages: 100,
              component: {
                items: [
                  { href: '/search-sbi?page=1', current: false },
                  { href: '/search-sbi?page=2', current: false },
                  { href: '/search-sbi?page=3', current: false },
                  { href: '/search-sbi?page=4', current: true },
                  { href: '/search-sbi?page=5', current: false },
                  { ellipsis: true },
                  { href: '/search-sbi?page=100', current: false }
                ],
                next: { href: '/search-sbi?page=5' },
                previous: { href: '/search-sbi?page=3' }
              }
            })
          })
        })

        describe('and page 49 is selected', () => {
          beforeEach(() => {
            selectedPage = 49
          })

          test('returns <- Previous 1 .. 48 [49] 50 .. 100 Next ->', () => {
            const result = paginationPresenter(numberOfRecords, selectedPage, path, currentAmount, message)

            expect(result).toMatchObject({
              currentPageNumber: selectedPage,
              numberOfPages: 100,
              component: {
                items: [
                  { href: '/search-sbi?page=1', current: false },
                  { ellipsis: true },
                  { href: '/search-sbi?page=48', current: false },
                  { href: '/search-sbi?page=49', current: true },
                  { href: '/search-sbi?page=50', current: false },
                  { ellipsis: true },
                  { href: '/search-sbi?page=100', current: false }
                ],
                next: { href: '/search-sbi?page=50' },
                previous: { href: '/search-sbi?page=48' }
              }
            })
          })
        })

        describe('and page 97 is selected', () => {
          beforeEach(() => {
            selectedPage = 97
          })

          test('returns <- Previous 1 .. 96 [97] 98 99 100 Next ->', () => {
            const result = paginationPresenter(numberOfRecords, selectedPage, path, currentAmount, message)

            expect(result).toMatchObject({
              currentPageNumber: selectedPage,
              numberOfPages: 100,
              component: {
                items: [
                  { href: '/search-sbi?page=1', current: false },
                  { ellipsis: true },
                  { href: '/search-sbi?page=96', current: false },
                  { href: '/search-sbi?page=97', current: true },
                  { href: '/search-sbi?page=98', current: false },
                  { href: '/search-sbi?page=99', current: false },
                  { href: '/search-sbi?page=100', current: false }
                ],
                next: { href: '/search-sbi?page=98' },
                previous: { href: '/search-sbi?page=96' }
              }
            })
          })
        })

        describe('and the last page is selected', () => {
          beforeEach(() => {
            currentAmount = 3
            selectedPage = 100
          })

          test('returns <- Previous 1 .. 96 97 98 99 [100]', () => {
            const result = paginationPresenter(numberOfRecords, selectedPage, path, currentAmount, message)

            expect(result).toMatchObject({
              currentPageNumber: selectedPage,
              numberOfPages: 100,
              component: {
                items: [
                  { href: '/search-sbi?page=1', current: false },
                  { ellipsis: true },
                  { href: '/search-sbi?page=96', current: false },
                  { href: '/search-sbi?page=97', current: false },
                  { href: '/search-sbi?page=98', current: false },
                  { href: '/search-sbi?page=99', current: false },
                  { href: '/search-sbi?page=100', current: true }
                ],
                previous: { href: '/search-sbi?page=99' }
              }
            })
          })

          describe('when "numberOfShownItems" is less than the default page size', () => {
            test('returns the "Showing 3 to 4975 businesses"', () => {
              const result = paginationPresenter(numberOfRecords, selectedPage, path, currentAmount, message)

              expect(result.showingMessage).toEqual('Showing 1981 to 1983 of 1995 businesses')
            })
          })
        })
      })
    })

    describe('and there are query arguments', () => {
      beforeEach(() => {
        queryArgs = {
          'crn': '01234567891',
        }
      })

      describe('URL encodes the query string', () => {
        beforeEach(() => {
          queryArgs = {
            name: 'Mr T'
          }
        })

        test('encodes special characters correctly', () => {
          const result = paginationPresenter(numberOfRecords, selectedPage, path, currentAmount, message, queryArgs)

          expect(result.component.previous.href).toEqual('/search-sbi?page=99&name=Mr+T')
        })
      })

      describe('for 2 pages', () => {
        beforeEach(() => {
          numberOfRecords = 35
        })

        describe('and the first page is selected', () => {
          beforeEach(() => {
            selectedPage = 1
          })

          test('returns [1] 2 Next ->', () => {
            const result = paginationPresenter(numberOfRecords, selectedPage, path, currentAmount, message, queryArgs)

            expect(result).toMatchObject({
              currentPageNumber: selectedPage,
              numberOfPages: 2,
              component: {
                items: [
                  {
                    href: '/search-sbi?page=1&crn=01234567891',
                    current: true
                  },
                  {
                    href: '/search-sbi?page=2&crn=01234567891',
                    current: false
                  }
                ],
                next: {
                  href: '/search-sbi?page=2&crn=01234567891'
                }
              }
            })
          })
        })

        describe('and the last page is selected', () => {
          beforeEach(() => {
            selectedPage = 2
          })

          test('returns <- Previous 1 [2]', () => {
            const result = paginationPresenter(numberOfRecords, selectedPage, path, currentAmount, message, queryArgs)

            expect(result).toMatchObject({
              currentPageNumber: selectedPage,
              numberOfPages: 2,
              component: {
                items: [
                  {
                    href: '/search-sbi?page=1&crn=01234567891',
                    current: false
                  },
                  {
                    href: '/search-sbi?page=2&crn=01234567891',
                    current: true
                  }
                ],
                previous: {
                  href: '/search-sbi?page=1&crn=01234567891'
                }
              }
            })
          })
        })
      })

      describe('for 3 pages', () => {
        beforeEach(() => {
          numberOfRecords = 55
        })

        describe('and the first page is selected', () => {
          beforeEach(() => {
            selectedPage = 1
          })

          test('returns [1] 2  3 Next ->', () => {
            const result = paginationPresenter(numberOfRecords, selectedPage, path, currentAmount, message, queryArgs)

            expect(result).toMatchObject({
              currentPageNumber: selectedPage,
              numberOfPages: 3,
              component: {
                items: [
                  {
                    href: '/search-sbi?page=1&crn=01234567891',
                    current: true
                  },
                  {
                    href: '/search-sbi?page=2&crn=01234567891',
                    current: false
                  },
                  {
                    href: '/search-sbi?page=3&crn=01234567891',
                    current: false
                  }
                ],
                next: {
                  href: '/search-sbi?page=2&crn=01234567891'
                }
              }
            })
          })
        })

        describe('and page 2 is selected', () => {
          beforeEach(() => {
            selectedPage = 2
          })

          test('returns <- Previous 1 [2] 3 Next ->', () => {
            const result = paginationPresenter(numberOfRecords, selectedPage, path, currentAmount, message, queryArgs)

            expect(result).toMatchObject({
              currentPageNumber: selectedPage,
              numberOfPages: 3,
              component: {
                items: [
                  {
                    href: '/search-sbi?page=1&crn=01234567891',
                    current: false
                  },
                  {
                    href: '/search-sbi?page=2&crn=01234567891',
                    current: true
                  },
                  {
                    href: '/search-sbi?page=3&crn=01234567891',
                    current: false
                  }
                ],
                next: {
                  href: '/search-sbi?page=3&crn=01234567891'
                },
                previous: {
                  href: '/search-sbi?page=1&crn=01234567891'
                }
              }
            })
          })
        })

        describe('and the last page is selected', () => {
          beforeEach(() => {
            selectedPage = 3
          })

          test('returns <- Previous 1 2 [3]', () => {
            const result = paginationPresenter(numberOfRecords, selectedPage, path, currentAmount, message, queryArgs)

            expect(result).toMatchObject({
              currentPageNumber: selectedPage,
              numberOfPages: 3,
              component: {
                items: [
                  {
                    href: '/search-sbi?page=1&crn=01234567891',
                    current: false
                  },
                  {
                    href: '/search-sbi?page=2&crn=01234567891',
                    current: false
                  },
                  {
                    href: '/search-sbi?page=3&crn=01234567891',
                    current: true
                  }
                ],
                previous: {
                  href: '/search-sbi?page=2&crn=01234567891'
                }
              }
            })
          })
        })
      })

      describe('for 4 pages', () => {
        beforeEach(() => {
          numberOfRecords = 75
        })

        describe('and the first page is selected', () => {
          beforeEach(() => {
            selectedPage = 1
          })

          test('returns [1] 2 3 4 Next ->', () => {
            const result = paginationPresenter(numberOfRecords, selectedPage, path, currentAmount, message, queryArgs)

            expect(result).toMatchObject({
              currentPageNumber: selectedPage,
              numberOfPages: 4,
              component: {
                items: [
                  {
                    href: '/search-sbi?page=1&crn=01234567891',
                    current: true
                  },
                  {
                    href: '/search-sbi?page=2&crn=01234567891',
                    current: false
                  },
                  {
                    href: '/search-sbi?page=3&crn=01234567891',
                    current: false
                  },
                  {
                    href: '/search-sbi?page=4&crn=01234567891',
                    current: false
                  }
                ],
                next: {
                  href: '/search-sbi?page=2&crn=01234567891'
                }
              }
            })
          })
        })

        describe('and page 2 is selected', () => {
          beforeEach(() => {
            selectedPage = 2
          })

          test('returns <- Previous 1 [2] 3 4 Next ->', () => {
            const result = paginationPresenter(numberOfRecords, selectedPage, path, currentAmount, message, queryArgs)

            expect(result).toMatchObject({
              currentPageNumber: selectedPage,
              numberOfPages: 4,
              component: {
                items: [
                  {
                    href: '/search-sbi?page=1&crn=01234567891',
                    current: false
                  },
                  {
                    href: '/search-sbi?page=2&crn=01234567891',
                    current: true
                  },
                  {
                    href: '/search-sbi?page=3&crn=01234567891',
                    current: false
                  },
                  {
                    href: '/search-sbi?page=4&crn=01234567891',
                    current: false
                  }
                ],
                next: {
                  href: '/search-sbi?page=3&crn=01234567891'
                },
                previous: {
                  href: '/search-sbi?page=1&crn=01234567891'
                }
              }
            })
          })
        })

        describe('and the last page is selected', () => {
          beforeEach(() => {
            selectedPage = 4
          })

          test('returns <- Previous 1 2 3 [4]', () => {
            const result = paginationPresenter(numberOfRecords, selectedPage, path, currentAmount, message, queryArgs)

            expect(result).toMatchObject({
              currentPageNumber: selectedPage,
              numberOfPages: 4,
              component: {
                items: [
                  {
                    href: '/search-sbi?page=1&crn=01234567891',
                    current: false
                  },
                  {
                    href: '/search-sbi?page=2&crn=01234567891',
                    current: false
                  },
                  {
                    href: '/search-sbi?page=3&crn=01234567891',
                    current: false
                  },
                  {
                    href: '/search-sbi?page=4&crn=01234567891',
                    current: true
                  }
                ],
                previous: {
                  href: '/search-sbi?page=3&crn=01234567891'
                }
              }
            })
          })
        })
      })

      describe('for 5 pages', () => {
        beforeEach(() => {
          numberOfRecords = 95
        })

        describe('and the first page is selected', () => {
          beforeEach(() => {
            selectedPage = 1
          })

          test('returns [1] 2 3 4 5 Next ->', () => {
            const result = paginationPresenter(numberOfRecords, selectedPage, path, currentAmount, message, queryArgs)

            expect(result).toMatchObject({
              currentPageNumber: selectedPage,
              numberOfPages: 5,
              component: {
                items: [
                  {
                    href: '/search-sbi?page=1&crn=01234567891',
                    current: true
                  },
                  {
                    href: '/search-sbi?page=2&crn=01234567891',
                    current: false
                  },
                  {
                    href: '/search-sbi?page=3&crn=01234567891',
                    current: false
                  },
                  {
                    href: '/search-sbi?page=4&crn=01234567891',
                    current: false
                  },
                  {
                    href: '/search-sbi?page=5&crn=01234567891',
                    current: false
                  }
                ],
                next: {
                  href: '/search-sbi?page=2&crn=01234567891'
                }
              }
            })
          })
        })

        describe('and page 3 is selected', () => {
          beforeEach(() => {
            selectedPage = 3
          })

          test('returns <- Previous 1 2 [3] 4 5 Next ->', () => {
            const result = paginationPresenter(numberOfRecords, selectedPage, path, currentAmount, message, queryArgs)

            expect(result).toMatchObject({
              currentPageNumber: selectedPage,
              numberOfPages: 5,
              component: {
                items: [
                  {
                    href: '/search-sbi?page=1&crn=01234567891',
                    current: false
                  },
                  {
                    href: '/search-sbi?page=2&crn=01234567891',
                    current: false
                  },
                  {
                    href: '/search-sbi?page=3&crn=01234567891',
                    current: true
                  },
                  {
                    href: '/search-sbi?page=4&crn=01234567891',
                    current: false
                  },
                  {
                    href: '/search-sbi?page=5&crn=01234567891',
                    current: false
                  }
                ],
                next: {
                  href: '/search-sbi?page=4&crn=01234567891'
                },
                previous: {
                  href: '/search-sbi?page=2&crn=01234567891'
                }
              }
            })
          })
        })

        describe('and the last page is selected', () => {
          beforeEach(() => {
            selectedPage = 5
          })

          test('returns <- Previous 1 2 3 4 [5]', () => {
            const result = paginationPresenter(numberOfRecords, selectedPage, path, currentAmount, message, queryArgs)

            expect(result).toMatchObject({
              currentPageNumber: selectedPage,
              numberOfPages: 5,
              component: {
                items: [
                  {
                    href: '/search-sbi?page=1&crn=01234567891',
                    current: false
                  },
                  {
                    href: '/search-sbi?page=2&crn=01234567891',
                    current: false
                  },
                  {
                    href: '/search-sbi?page=3&crn=01234567891',
                    current: false
                  },
                  {
                    href: '/search-sbi?page=4&crn=01234567891',
                    current: false
                  },
                  {
                    href: '/search-sbi?page=5&crn=01234567891',
                    current: true
                  }
                ],
                previous: {
                  href: '/search-sbi?page=4&crn=01234567891'
                }
              }
            })
          })
        })
      })

      describe('for 6 pages', () => {
        beforeEach(() => {
          numberOfRecords = 115
        })

        describe('and the first page is selected', () => {
          beforeEach(() => {
            selectedPage = 1
          })

          test('returns [1] 2 3 4 5 6 Next ->', () => {
            const result = paginationPresenter(numberOfRecords, selectedPage, path, currentAmount, message, queryArgs)

            expect(result).toMatchObject({
              currentPageNumber: selectedPage,
              numberOfPages: 6,
              component: {
                items: [
                  {
                    href: '/search-sbi?page=1&crn=01234567891',
                    current: true
                  },
                  {
                    href: '/search-sbi?page=2&crn=01234567891',
                    current: false
                  },
                  {
                    href: '/search-sbi?page=3&crn=01234567891',
                    current: false
                  },
                  {
                    href: '/search-sbi?page=4&crn=01234567891',
                    current: false
                  },
                  {
                    href: '/search-sbi?page=5&crn=01234567891',
                    current: false
                  },
                  {
                    href: '/search-sbi?page=6&crn=01234567891',
                    current: false
                  }
                ],
                next: {
                  href: '/search-sbi?page=2&crn=01234567891'
                }
              }
            })
          })
        })

        describe('and page 3 is selected', () => {
          beforeEach(() => {
            selectedPage = 3
          })

          test('returns <- Previous 1 2 [3] 4 5 6 Next ->', () => {
            const result = paginationPresenter(numberOfRecords, selectedPage, path, currentAmount, message, queryArgs)

            expect(result).toMatchObject({
              currentPageNumber: selectedPage,
              numberOfPages: 6,
              component: {
                items: [
                  {
                    href: '/search-sbi?page=1&crn=01234567891',
                    current: false
                  },
                  {
                    href: '/search-sbi?page=2&crn=01234567891',
                    current: false
                  },
                  {
                    href: '/search-sbi?page=3&crn=01234567891',
                    current: true
                  },
                  {
                    href: '/search-sbi?page=4&crn=01234567891',
                    current: false
                  },
                  {
                    href: '/search-sbi?page=5&crn=01234567891',
                    current: false
                  },
                  {
                    href: '/search-sbi?page=6&crn=01234567891',
                    current: false
                  }
                ],
                next: {
                  href: '/search-sbi?page=4&crn=01234567891'
                },
                previous: {
                  href: '/search-sbi?page=2&crn=01234567891'
                }
              }
            })
          })
        })

        describe('and the last page is selected', () => {
          beforeEach(() => {
            selectedPage = 6
          })

          test('returns <- Previous 1 2 3 4 5 [6]', () => {
            const result = paginationPresenter(numberOfRecords, selectedPage, path, currentAmount, message, queryArgs)

            expect(result).toMatchObject({
              currentPageNumber: selectedPage,
              numberOfPages: 6,
              component: {
                items: [
                  {
                    href: '/search-sbi?page=1&crn=01234567891',
                    current: false
                  },
                  {
                    href: '/search-sbi?page=2&crn=01234567891',
                    current: false
                  },
                  {
                    href: '/search-sbi?page=3&crn=01234567891',
                    current: false
                  },
                  {
                    href: '/search-sbi?page=4&crn=01234567891',
                    current: false
                  },
                  {
                    href: '/search-sbi?page=5&crn=01234567891',
                    current: false
                  },
                  {
                    href: '/search-sbi?page=6&crn=01234567891',
                    current: true
                  }
                ],
                previous: {
                  href: '/search-sbi?page=5&crn=01234567891'
                }
              }
            })
          })
        })
      })

      describe('for 7 pages', () => {
        beforeEach(() => {
          numberOfRecords = 135
        })

        describe('and the first page is selected', () => {
          beforeEach(() => {
            selectedPage = 1
          })

          test('returns [1] 2 3 4 5 6 7 Next ->', () => {
            const result = paginationPresenter(numberOfRecords, selectedPage, path, currentAmount, message, queryArgs)

            expect(result).toMatchObject({
              currentPageNumber: selectedPage,
              numberOfPages: 7,
              component: {
                items: [
                  {
                    href: '/search-sbi?page=1&crn=01234567891',
                    current: true
                  },
                  {
                    href: '/search-sbi?page=2&crn=01234567891',
                    current: false
                  },
                  {
                    href: '/search-sbi?page=3&crn=01234567891',
                    current: false
                  },
                  {
                    href: '/search-sbi?page=4&crn=01234567891',
                    current: false
                  },
                  {
                    href: '/search-sbi?page=5&crn=01234567891',
                    current: false
                  },
                  {
                    href: '/search-sbi?page=6&crn=01234567891',
                    current: false
                  },
                  {
                    href: '/search-sbi?page=7&crn=01234567891',
                    current: false
                  }
                ],
                next: {
                  href: '/search-sbi?page=2&crn=01234567891'
                }
              }
            })
          })
        })

        describe('and page 4 is selected', () => {
          beforeEach(() => {
            selectedPage = 4
          })

          test('returns <- Previous 1 2 3 [4] 5 6 7 Next ->', () => {
            const result = paginationPresenter(numberOfRecords, selectedPage, path, currentAmount, message, queryArgs)

            expect(result).toMatchObject({
              currentPageNumber: selectedPage,
              numberOfPages: 7,
              component: {
                items: [
                  {
                    href: '/search-sbi?page=1&crn=01234567891',
                    current: false
                  },
                  {
                    href: '/search-sbi?page=2&crn=01234567891',
                    current: false
                  },
                  {
                    href: '/search-sbi?page=3&crn=01234567891',
                    current: false
                  },
                  {
                    href: '/search-sbi?page=4&crn=01234567891',
                    current: true
                  },
                  {
                    href: '/search-sbi?page=5&crn=01234567891',
                    current: false
                  },
                  {
                    href: '/search-sbi?page=6&crn=01234567891',
                    current: false
                  },
                  {
                    href: '/search-sbi?page=7&crn=01234567891',
                    current: false
                  }
                ],
                next: {
                  href: '/search-sbi?page=5&crn=01234567891'
                },
                previous: {
                  href: '/search-sbi?page=3&crn=01234567891'
                }
              }
            })
          })
        })

        describe('and the last page is selected', () => {
          beforeEach(() => {
            selectedPage = 7
          })

          test('returns <- Previous 1 2 3 4 5 6 [7]', () => {
            const result = paginationPresenter(numberOfRecords, selectedPage, path, currentAmount, message, queryArgs)

            expect(result).toMatchObject({
              currentPageNumber: selectedPage,
              numberOfPages: 7,
              component: {
                items: [
                  {
                    href: '/search-sbi?page=1&crn=01234567891',
                    current: false
                  },
                  {
                    href: '/search-sbi?page=2&crn=01234567891',
                    current: false
                  },
                  {
                    href: '/search-sbi?page=3&crn=01234567891',
                    current: false
                  },
                  {
                    href: '/search-sbi?page=4&crn=01234567891',
                    current: false
                  },
                  {
                    href: '/search-sbi?page=5&crn=01234567891',
                    current: false
                  },
                  {
                    href: '/search-sbi?page=6&crn=01234567891',
                    current: false
                  },
                  {
                    href: '/search-sbi?page=7&crn=01234567891',
                    current: true
                  }
                ],
                previous: {
                  href: '/search-sbi?page=6&crn=01234567891'
                }
              }
            })
          })
        })
      })

      describe('for 8 pages', () => {
        beforeEach(() => {
          numberOfRecords = 155
        })

        describe('and the first page is selected', () => {
          beforeEach(() => {
            selectedPage = 1
          })

          test('returns [1] 2 3 4 5 .. 8 Next ->', () => {
            const result = paginationPresenter(numberOfRecords, selectedPage, path, currentAmount, message, queryArgs)

            expect(result).toMatchObject({
              currentPageNumber: selectedPage,
              numberOfPages: 8,
              component: {
                items: [
                  {
                    href: '/search-sbi?page=1&crn=01234567891',
                    current: true
                  },
                  {
                    href: '/search-sbi?page=2&crn=01234567891',
                    current: false
                  },
                  {
                    href: '/search-sbi?page=3&crn=01234567891',
                    current: false
                  },
                  {
                    href: '/search-sbi?page=4&crn=01234567891',
                    current: false
                  },
                  {
                    href: '/search-sbi?page=5&crn=01234567891',
                    current: false
                  },
                  { ellipsis: true },
                  {
                    href: '/search-sbi?page=8&crn=01234567891',
                    current: false
                  }
                ],
                next: {
                  href: '/search-sbi?page=2&crn=01234567891'
                }
              }
            })
          })
        })

        describe('and page 4 is selected', () => {
          beforeEach(() => {
            selectedPage = 4
          })

          test('returns <- Previous 1 2 3 [4] 5 .. 8 Next ->', () => {
            const result = paginationPresenter(numberOfRecords, selectedPage, path, currentAmount, message, queryArgs)

            expect(result).toMatchObject({
              currentPageNumber: selectedPage,
              numberOfPages: 8,
              component: {
                items: [
                  {
                    href: '/search-sbi?page=1&crn=01234567891',
                    current: false
                  },
                  {
                    href: '/search-sbi?page=2&crn=01234567891',
                    current: false
                  },
                  {
                    href: '/search-sbi?page=3&crn=01234567891',
                    current: false
                  },
                  {
                    href: '/search-sbi?page=4&crn=01234567891',
                    current: true
                  },
                  {
                    href: '/search-sbi?page=5&crn=01234567891',
                    current: false
                  },
                  { ellipsis: true },
                  {
                    href: '/search-sbi?page=8&crn=01234567891',
                    current: false
                  }
                ],
                next: {
                  href: '/search-sbi?page=5&crn=01234567891'
                },
                previous: {
                  href: '/search-sbi?page=3&crn=01234567891'
                }
              }
            })
          })
        })

        describe('and page 5 is selected', () => {
          beforeEach(() => {
            selectedPage = 5
          })

          test('returns <- Previous 1 .. 4 [5] 6 7 8 Next ->', () => {
            const result = paginationPresenter(numberOfRecords, selectedPage, path, currentAmount, message, queryArgs)

            expect(result).toMatchObject({
              currentPageNumber: selectedPage,
              numberOfPages: 8,
              component: {
                items: [
                  {
                    href: '/search-sbi?page=1&crn=01234567891',
                    current: false
                  },
                  { ellipsis: true },
                  {
                    href: '/search-sbi?page=4&crn=01234567891',
                    current: false
                  },
                  {
                    href: '/search-sbi?page=5&crn=01234567891',
                    current: true
                  },
                  {
                    href: '/search-sbi?page=6&crn=01234567891',
                    current: false
                  },
                  {
                    href: '/search-sbi?page=7&crn=01234567891',
                    current: false
                  },
                  {
                    href: '/search-sbi?page=8&crn=01234567891',
                    current: false
                  }
                ],
                next: {
                  href: '/search-sbi?page=6&crn=01234567891'
                },
                previous: {
                  href: '/search-sbi?page=4&crn=01234567891'
                }
              }
            })
          })
        })

        describe('and the last page is selected', () => {
          beforeEach(() => {
            selectedPage = 8
          })

          test('returns <- Previous 1 .. 4 5 6 7 [8]', () => {
            const result = paginationPresenter(numberOfRecords, selectedPage, path, currentAmount, message, queryArgs)

            expect(result).toMatchObject({
              currentPageNumber: selectedPage,
              numberOfPages: 8,
              component: {
                items: [
                  {
                    href: '/search-sbi?page=1&crn=01234567891',
                    current: false
                  },
                  { ellipsis: true },
                  {
                    href: '/search-sbi?page=4&crn=01234567891',
                    current: false
                  },
                  {
                    href: '/search-sbi?page=5&crn=01234567891',
                    current: false
                  },
                  {
                    href: '/search-sbi?page=6&crn=01234567891',
                    current: false
                  },
                  {
                    href: '/search-sbi?page=7&crn=01234567891',
                    current: false
                  },
                  {
                    href: '/search-sbi?page=8&crn=01234567891',
                    current: true
                  }
                ],
                previous: {
                  href: '/search-sbi?page=7&crn=01234567891'
                }
              }
            })
          })
        })
      })

      describe('for 9 pages', () => {
        beforeEach(() => {
          numberOfRecords = 175
        })

        describe('and the first page is selected', () => {
          beforeEach(() => {
            selectedPage = 1
          })

          test('returns [1] 2 3 4 5 .. 9 Next ->', () => {
            const result = paginationPresenter(numberOfRecords, selectedPage, path, currentAmount, message, queryArgs)

            expect(result).toMatchObject({
              currentPageNumber: selectedPage,
              numberOfPages: 9,
              component: {
                items: [
                  {
                    href: '/search-sbi?page=1&crn=01234567891',
                    current: true
                  },
                  {
                    href: '/search-sbi?page=2&crn=01234567891',
                    current: false
                  },
                  {
                    href: '/search-sbi?page=3&crn=01234567891',
                    current: false
                  },
                  {
                    href: '/search-sbi?page=4&crn=01234567891',
                    current: false
                  },
                  {
                    href: '/search-sbi?page=5&crn=01234567891',
                    current: false
                  },
                  { ellipsis: true },
                  {
                    href: '/search-sbi?page=9&crn=01234567891',
                    current: false
                  }
                ],
                next: {
                  href: '/search-sbi?page=2&crn=01234567891'
                }
              }
            })
          })
        })

        describe('and page 4 is selected', () => {
          beforeEach(() => {
            selectedPage = 4
          })

          test('returns <- Previous 1 2 3 [4] 5 .. 9 Next ->', () => {
            const result = paginationPresenter(numberOfRecords, selectedPage, path, currentAmount, message, queryArgs)

            expect(result).toMatchObject({
              currentPageNumber: selectedPage,
              numberOfPages: 9,
              component: {
                items: [
                  {
                    href: '/search-sbi?page=1&crn=01234567891',
                    current: false
                  },
                  {
                    href: '/search-sbi?page=2&crn=01234567891',
                    current: false
                  },
                  {
                    href: '/search-sbi?page=3&crn=01234567891',
                    current: false
                  },
                  {
                    href: '/search-sbi?page=4&crn=01234567891',
                    current: true
                  },
                  {
                    href: '/search-sbi?page=5&crn=01234567891',
                    current: false
                  },
                  { ellipsis: true },
                  {
                    href: '/search-sbi?page=9&crn=01234567891',
                    current: false
                  }
                ],
                next: {
                  href: '/search-sbi?page=5&crn=01234567891'
                },
                previous: {
                  href: '/search-sbi?page=3&crn=01234567891'
                }
              }
            })
          })
        })

        describe('and page 5 is selected', () => {
          beforeEach(() => {
            selectedPage = 5
          })

          test('returns <- Previous 1 .. 4 [5] 6 .. 9 Next ->', () => {
            const result = paginationPresenter(numberOfRecords, selectedPage, path, currentAmount, message, queryArgs)

            expect(result).toMatchObject({
              currentPageNumber: selectedPage,
              numberOfPages: 9,
              component: {
                items: [
                  {
                    href: '/search-sbi?page=1&crn=01234567891',
                    current: false
                  },
                  { ellipsis: true },
                  {
                    href: '/search-sbi?page=4&crn=01234567891',
                    current: false
                  },
                  {
                    href: '/search-sbi?page=5&crn=01234567891',
                    current: true
                  },
                  {
                    href: '/search-sbi?page=6&crn=01234567891',
                    current: false
                  },
                  { ellipsis: true },
                  {
                    href: '/search-sbi?page=9&crn=01234567891',
                    current: false
                  }
                ],
                next: {
                  href: '/search-sbi?page=6&crn=01234567891'
                },
                previous: {
                  href: '/search-sbi?page=4&crn=01234567891'
                }
              }
            })
          })
        })

        describe('and page 6 is selected', () => {
          beforeEach(() => {
            selectedPage = 6
          })

          test('returns <- Previous 1 .. 5 [6] 7 8 9 Next ->', () => {
            const result = paginationPresenter(numberOfRecords, selectedPage, path, currentAmount, message, queryArgs)

            expect(result).toMatchObject({
              currentPageNumber: selectedPage,
              numberOfPages: 9,
              component: {
                items: [
                  {
                    href: '/search-sbi?page=1&crn=01234567891',
                    current: false
                  },
                  { ellipsis: true },
                  {
                    href: '/search-sbi?page=5&crn=01234567891',
                    current: false
                  },
                  {
                    href: '/search-sbi?page=6&crn=01234567891',
                    current: true
                  },
                  {
                    href: '/search-sbi?page=7&crn=01234567891',
                    current: false
                  },
                  {
                    href: '/search-sbi?page=8&crn=01234567891',
                    current: false
                  },
                  {
                    href: '/search-sbi?page=9&crn=01234567891',
                    current: false
                  }
                ],
                next: {
                  href: '/search-sbi?page=7&crn=01234567891'
                },
                previous: {
                  href: '/search-sbi?page=5&crn=01234567891'
                }
              }
            })
          })
        })

        describe('and the last page is selected', () => {
          beforeEach(() => {
            selectedPage = 9
          })

          test('returns <- Previous 1 .. 5 6 7 8 [9]', () => {
            const result = paginationPresenter(numberOfRecords, selectedPage, path, currentAmount, message, queryArgs)

            expect(result).toMatchObject({
              currentPageNumber: selectedPage,
              numberOfPages: 9,
              component: {
                items: [
                  {
                    href: '/search-sbi?page=1&crn=01234567891',
                    current: false
                  },
                  { ellipsis: true },
                  {
                    href: '/search-sbi?page=5&crn=01234567891',
                    current: false
                  },
                  {
                    href: '/search-sbi?page=6&crn=01234567891',
                    current: false
                  },
                  {
                    href: '/search-sbi?page=7&crn=01234567891',
                    current: false
                  },
                  {
                    href: '/search-sbi?page=8&crn=01234567891',
                    current: false
                  },
                  {
                    href: '/search-sbi?page=9&crn=01234567891',
                    current: true
                  }
                ],
                previous: {
                  href: '/search-sbi?page=8&crn=01234567891'
                }
              }
            })
          })
        })
      })

      describe('for 100 pages', () => {
        beforeEach(() => {
          numberOfRecords = 1995
        })

        describe('and the first page is selected', () => {
          beforeEach(() => {
            selectedPage = 1
          })

          test('returns [1] 2 3 4 5 .. 100 Next ->', () => {
            const result = paginationPresenter(numberOfRecords, selectedPage, path, currentAmount, message, queryArgs)

            expect(result).toMatchObject({
              currentPageNumber: selectedPage,
              numberOfPages: 100,
              component: {
                items: [
                  {
                    href: '/search-sbi?page=1&crn=01234567891',
                    current: true
                  },
                  {
                    href: '/search-sbi?page=2&crn=01234567891',
                    current: false
                  },
                  {
                    href: '/search-sbi?page=3&crn=01234567891',
                    current: false
                  },
                  {
                    href: '/search-sbi?page=4&crn=01234567891',
                    current: false
                  },
                  {
                    href: '/search-sbi?page=5&crn=01234567891',
                    current: false
                  },
                  { ellipsis: true },
                  {
                    href: '/search-sbi?page=100&crn=01234567891',
                    current: false
                  }
                ],
                next: {
                  href: '/search-sbi?page=2&crn=01234567891'
                }
              }
            })
          })
        })

        describe('and page 4 is selected', () => {
          beforeEach(() => {
            selectedPage = 4
          })

          test('returns <- Previous 1 2 3 [4] 5 .. 100 Next ->', () => {
            const result = paginationPresenter(numberOfRecords, selectedPage, path, currentAmount, message, queryArgs)

            expect(result).toMatchObject({
              currentPageNumber: selectedPage,
              numberOfPages: 100,
              component: {
                items: [
                  {
                    href: '/search-sbi?page=1&crn=01234567891',
                    current: false
                  },
                  {
                    href: '/search-sbi?page=2&crn=01234567891',
                    current: false
                  },
                  {
                    href: '/search-sbi?page=3&crn=01234567891',
                    current: false
                  },
                  {
                    href: '/search-sbi?page=4&crn=01234567891',
                    current: true
                  },
                  {
                    href: '/search-sbi?page=5&crn=01234567891',
                    current: false
                  },
                  { ellipsis: true },
                  {
                    href: '/search-sbi?page=100&crn=01234567891',
                    current: false
                  }
                ],
                next: {
                  href: '/search-sbi?page=5&crn=01234567891'
                },
                previous: {
                  href: '/search-sbi?page=3&crn=01234567891'
                }
              }
            })
          })
        })

        describe('and page 49 is selected', () => {
          beforeEach(() => {
            selectedPage = 49
          })

          test('returns <- Previous 1 .. 48 [49] 50 .. 100 Next ->', () => {
            const result = paginationPresenter(numberOfRecords, selectedPage, path, currentAmount, message, queryArgs)

            expect(result).toMatchObject({
              currentPageNumber: selectedPage,
              numberOfPages: 100,
              component: {
                items: [
                  {
                    href: '/search-sbi?page=1&crn=01234567891',
                    current: false
                  },
                  { ellipsis: true },
                  {
                    href: '/search-sbi?page=48&crn=01234567891',
                    current: false
                  },
                  {
                    href: '/search-sbi?page=49&crn=01234567891',
                    current: true
                  },
                  {
                    href: '/search-sbi?page=50&crn=01234567891',
                    current: false
                  },
                  { ellipsis: true },
                  {
                    href: '/search-sbi?page=100&crn=01234567891',
                    current: false
                  }
                ],
                next: {
                  href: '/search-sbi?page=50&crn=01234567891'
                },
                previous: {
                  href: '/search-sbi?page=48&crn=01234567891'
                }
              }
            })
          })
        })

        describe('and page 97 is selected', () => {
          beforeEach(() => {
            selectedPage = 97
          })

          test('returns <- Previous 1 .. 96 [97] 98 99 100 Next ->', () => {
            const result = paginationPresenter(numberOfRecords, selectedPage, path, currentAmount, message, queryArgs)

            expect(result).toMatchObject({
              currentPageNumber: selectedPage,
              numberOfPages: 100,
              component: {
                items: [
                  {
                    href: '/search-sbi?page=1&crn=01234567891',
                    current: false
                  },
                  { ellipsis: true },
                  {
                    href: '/search-sbi?page=96&crn=01234567891',
                    current: false
                  },
                  {
                    href: '/search-sbi?page=97&crn=01234567891',
                    current: true
                  },
                  {
                    href: '/search-sbi?page=98&crn=01234567891',
                    current: false
                  },
                  {
                    href: '/search-sbi?page=99&crn=01234567891',
                    current: false
                  },
                  {
                    href: '/search-sbi?page=100&crn=01234567891',
                    current: false
                  }
                ],
                next: {
                  href: '/search-sbi?page=98&crn=01234567891'
                },
                previous: {
                  href: '/search-sbi?page=96&crn=01234567891'
                }
              }
            })
          })
        })

        describe('and the last page is selected', () => {
          beforeEach(() => {
            selectedPage = 100
          })

          test('returns <- Previous 1 .. 96 97 98 99 [100]', () => {
            const result = paginationPresenter(numberOfRecords, selectedPage, path, currentAmount, message, queryArgs)

            expect(result).toMatchObject({
              currentPageNumber: selectedPage,
              numberOfPages: 100,
              component: {
                items: [
                  {
                    href: '/search-sbi?page=1&crn=01234567891',
                    current: false
                  },
                  { ellipsis: true },
                  {
                    href: '/search-sbi?page=96&crn=01234567891',
                    current: false
                  },
                  {
                    href: '/search-sbi?page=97&crn=01234567891',
                    current: false
                  },
                  {
                    href: '/search-sbi?page=98&crn=01234567891',
                    current: false
                  },
                  {
                    href: '/search-sbi?page=99&crn=01234567891',
                    current: false
                  },
                  {
                    href: '/search-sbi?page=100&crn=01234567891',
                    current: true
                  }
                ],
                previous: {
                  href: '/search-sbi?page=99&crn=01234567891'
                }
              }
            })
          })
        })
      })
    })
  })
})
