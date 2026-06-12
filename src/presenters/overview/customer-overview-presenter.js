/**
 * Formats data ready for presenting in the `/search-crn` page
 * @module customerOverviewPresenter
 */

import { paginationPresenter } from '../pagination-presenter.js'

const PAGE_SIZE = 20

const customerOverviewPresenter = (customerDetails, pageNumber) => {
  const businesses = customerDetails?.businesses ?? []
  const totalBusinesses = businesses.length
  const requestedPageNumber = normalisePageNumber(pageNumber)
  const currentPageNumber = clampPageNumber(requestedPageNumber, totalBusinesses)
  const pagedBusinesses = paginateBusinesses(businesses, currentPageNumber)
  const pagination = paginationPresenter(
    totalBusinesses,
    currentPageNumber,
    `/customer-overview/${customerDetails?.info?.crn}`,
    pagedBusinesses.length,
    'businesses'
  )

  return {
    customerName: customerDetails?.info?.customerName || '',
    crn: customerDetails?.info?.crn || '',
    hasBusinesses: totalBusinesses > 0,
    businesses: formatBusinessesToRows(pagedBusinesses),
    pagination,
    breadcrumbs: [
      {
        text: 'Search results',
        href: '/search-sbi'
      }
    ]
  }
}

/**
 * Converts whatever page number came from the URL query into a valid number
 * @private
 */
const normalisePageNumber = (pageNumber) => {
  const parsedPage = Number(pageNumber)

  if (!Number.isInteger(parsedPage) || parsedPage < 1) {
    return 1
  }

  return parsedPage
}

/**
 * Caps a requested page to that max so we never point past the final page.
 *
 * If a user has requested a page that is beyond the end of the list of results i.e they have manually edited the URL
 * to have an invalid page number, we will show them the last page of results instead of an empty page.
 * @private
 */
const clampPageNumber = (requestedPageNumber, totalBusinesses) => {
  const totalPages = Math.ceil(totalBusinesses / PAGE_SIZE)

  // When there are no businesses we still treat page 1 as the only valid page.
  let maxPageNumber = totalPages

  if (maxPageNumber < 1) {
    maxPageNumber = 1
  }

  if (requestedPageNumber > maxPageNumber) {
    return maxPageNumber
  }

  return requestedPageNumber
}

/**
 * Returns only the businesses for the current page.
 * @private
 */
const paginateBusinesses = (businesses, currentPageNumber) => {
  // Page 1 starts at index 0, page 2 starts at index 20, etc.
  const pageOffset = currentPageNumber - 1
  const startIndex = pageOffset * PAGE_SIZE

  // Include up to PAGE_SIZE items from the starting index.
  const endIndex = startIndex + PAGE_SIZE
  const businessesForCurrentPage = businesses.slice(startIndex, endIndex)

  return businessesForCurrentPage
}

const formatBusinessesToRows = (businesses = []) => {
  const rows = businesses.map((business) => [
    {
      html: `<a href="/business/${business?.sbi ?? ''}" class="govuk-link govuk-link--no-visited-state">${business?.name ?? ''}</a>`
    },
    {
      text: business?.sbi ?? ''
    }
  ])

  return { rows }
}

export {
  customerOverviewPresenter
}
