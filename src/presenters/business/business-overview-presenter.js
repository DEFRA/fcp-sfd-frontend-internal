/**
 * Formats data ready for presenting in the `/business-overview` page
 * @module businessOverviewPresenter
 */

import { paginationPresenter, PAGE_SIZE_DEFAULT } from '../pagination-presenter.js'

/**
 * Transforms raw business overview data into the shape expected by the
 * business-overview Nunjucks template.
 *
 * @param {object} data - Mapped DAL response from fetchBusinessOverviewService
 * @param {number} [page=1] - The current page number (from the `?page` query param)
 * @returns {object} Presenter object passed directly to the view
 */
const businessOverviewPresenter = (data, page = 1) => {
  // Build the full customer list first — pagination slices this below.
  // Names are constructed from firstName + lastName, filtering out any nulls
  // so a missing first or last name doesn't leave a leading/trailing space.
  const allCustomers = data.customers.map((customer) => ({
    name: [customer.firstName, customer.lastName].filter(Boolean).join(' '),
    crn: customer.crn
  }))

  // Work out which slice of customers belongs on the current page.
  // e.g. page 2 with PAGE_SIZE_DEFAULT=20: startIndex=20, slice [20..39]
  const startIndex = (page - 1) * PAGE_SIZE_DEFAULT
  const paginatedCustomers = allCustomers.slice(startIndex, startIndex + PAGE_SIZE_DEFAULT)

  // The SBI must be included in the pagination hrefs so each page link
  // continues to show the correct business (e.g. /business-overview?sbi=123&page=2)
  const baseUrl = `/business-overview?sbi=${data.sbi}`

  // paginationPresenter returns null when there is only one page, in which
  // case the template simply won't render the pagination component.
  const pagination = paginationPresenter({
    totalItems: allCustomers.length,
    currentPage: page,
    pageSize: PAGE_SIZE_DEFAULT,
    baseUrl
  })

  return {
    searchResultsLink: '/search-sbi',
    pageTitle: 'Business overview',
    sbi: data.sbi,
    businessName: data.businessName,
    customers: paginatedCustomers, // Only the slice for the current page
    pagination // null (no component) or { previous, next, items } for govukPagination
  }
}

export {
  businessOverviewPresenter
}
