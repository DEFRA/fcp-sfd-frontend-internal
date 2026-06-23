/**
 * Formats data ready for presenting in the `/business-overview/{sbi}` page
 * @module businessOverviewPresenter
 */

import { paginationPresenter } from '../pagination-presenter.js'
import { BUSINESS_OVERVIEW_PAGE_SIZE as PAGE_SIZE } from '../../constants/pagination.js'

const businessOverviewPresenter = (businessDetails, page) => {
  const customers = businessDetails?.customers ?? []

  const { sortedCustomers, totalCustomers } = sortAndCountCustomers(customers)
  const requestedPageNumber = normalisePageNumber(page)
  const currentPage = clampPageNumber(requestedPageNumber, totalCustomers)
  const pagedCustomers = paginateCustomers(sortedCustomers, currentPage)
  const routeURL = `/business-overview/${businessDetails?.sbi}`

  const pagination = paginationPresenter(totalCustomers, currentPage, routeURL, pagedCustomers.length, 'customers')

  return {
    pageTitle: 'Business overview',
    sbi: businessDetails?.sbi || '',
    businessName: businessDetails?.businessName || '',
    hasCustomers: totalCustomers > 0,
    customers: formatCustomers(pagedCustomers),
    pagination,
    breadcrumbs: [
      {
        text: 'Search for another business',
        href: '/search-sbi'
      }
    ]
  }
}

/**
 * Assembles a customer's full name from their first and last name parts.
 * @private
 */
const buildName = (firstName, lastName) => {
  return [firstName, lastName].filter(Boolean).join(' ')
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
 * Sorts a list of customers by their full assembled name in alphabetical order (A → Z).
 *
 * - Does NOT change the original array (it creates a copy first)
 * - Sorting is case-insensitive (e.g. "alice" and "Alice" are treated the same)
 *
 * localeCompare compares two strings:
 * - returns < 0 if a comes before b
 * - returns 0 if they are equal
 * - returns > 0 if a comes after b
 *
 * @private
 */
const sortAndCountCustomers = (customers) => {
  const customersCopy = [...customers]

  customersCopy.sort((a, b) => {
    const nameA = buildName(a?.firstName, a?.lastName).toLowerCase()
    const nameB = buildName(b?.firstName, b?.lastName).toLowerCase()

    return nameA.localeCompare(nameB)
  })

  return {
    sortedCustomers: customersCopy,
    totalCustomers: customersCopy.length
  }
}

/**
 * Caps a requested page to the max so we never point past the final page.
 *
 * If a user has requested a page that is beyond the end of the list of results i.e they have manually edited the URL
 * to have an invalid page number, we will show them the last page of results instead of an empty page.
 * @private
 */
const clampPageNumber = (requestedPageNumber, totalCustomers) => {
  const totalPages = Math.ceil(totalCustomers / PAGE_SIZE)

  // When there are no customers we still treat page 1 as the only valid page.
  const maxPageNumber = Math.max(totalPages, 1)

  if (requestedPageNumber > maxPageNumber) {
    return maxPageNumber
  }

  return requestedPageNumber
}

/**
 * Returns only the customers for the current page.
 * @private
 */
const paginateCustomers = (customers, currentPage) => {
  const startIndex = (currentPage - 1) * PAGE_SIZE
  const endIndex = startIndex + PAGE_SIZE

  return customers.slice(startIndex, endIndex)
}

const formatCustomer = (customer) => ({
  fullName: buildName(customer?.firstName, customer?.lastName),
  crn: customer?.crn ?? ''
})

const formatCustomers = (customers = []) => {
  return customers.map(formatCustomer)
}

export {
  businessOverviewPresenter
}
