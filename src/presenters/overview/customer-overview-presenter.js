/**
 * Formats data ready for presenting in the `/customer-overview/{crn}` page
 * @module customerOverviewPresenter
 */

import { paginationPresenter } from '../pagination-presenter.js'
import { CUSTOMER_OVERVIEW_PAGE_SIZE as PAGE_SIZE } from '../../constants/pagination.js'

const customerOverviewPresenter = (customerDetails, page) => {
  const businesses = customerDetails?.businesses ?? []

  const { sortedBusinesses, totalBusinesses } = sortAndCountBusinesses(businesses)
  const requestedPageNumber = normalisePageNumber(page)
  const currentPage = clampPageNumber(requestedPageNumber, totalBusinesses)
  const pagedBusinesses = paginateBusinesses(sortedBusinesses, currentPage)
  const routeURL = `/customer-overview/${customerDetails?.info?.crn}`

  const pagination = paginationPresenter(totalBusinesses, currentPage, routeURL, pagedBusinesses.length, 'businesses')

  return {
    customerName: customerDetails?.info?.customerName || '',
    crn: customerDetails?.info?.crn || '',
    hasBusinesses: totalBusinesses > 0,
    businesses: formatBusinessesToRows(pagedBusinesses),
    pagination,
    breadcrumbs: [
      {
        text: 'Search results',
        href: '/search-crn'
      }
    ]
  }
}

/**
 * Converts whatever page number came from the URL query into a valid number
 * @private
 */
const normalisePageNumber = (page) => {
  const parsedPage = Number(page)

  if (!Number.isInteger(parsedPage) || parsedPage < 1) {
    return 1
  }

  return parsedPage
}

/**
 * Sorts a list of businesses by their name in alphabetical order (A → Z).
 *
 * - Does NOT change the original array (it creates a copy first)
 * - Sorting is case-insensitive (e.g. "apple" and "Apple" are treated the same)
 *
 * localeCompare compares two strings:
 * - returns < 0 if a comes before b
 * - returns 0 if they are equal
 * - returns > 0 if a comes after b
 *
 * @private
 */
const sortAndCountBusinesses = (businesses) => {
  const businessesCopy = [...businesses]

  businessesCopy.sort((a, b) => {
    const nameA = (a?.name ?? '').toLowerCase()
    const nameB = (b?.name ?? '').toLowerCase()

    return nameA.localeCompare(nameB)
  })

  return {
    sortedBusinesses: businessesCopy,
    totalBusinesses: businessesCopy.length
  }
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
  const maxPageNumber = Math.max(totalPages, 1)

  if (requestedPageNumber > maxPageNumber) {
    return maxPageNumber
  }

  return requestedPageNumber
}

/**
 * Returns only the businesses for the current page.
 * @private
 */
const paginateBusinesses = (businesses, currentPage) => {
  const startIndex = (currentPage - 1) * PAGE_SIZE
  const endIndex = startIndex + PAGE_SIZE

  return businesses.slice(startIndex, endIndex)
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
