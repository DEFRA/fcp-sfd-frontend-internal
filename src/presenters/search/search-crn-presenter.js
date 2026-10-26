/**
 * Formats data ready for presenting in the `/search-crn` page
 *
 * @module searchCrnPresenter
 */

import { formatAddressLines } from '../base-presenter.js'
import { SEARCH_CRN } from '../../constants/search-links.js'

/**
 * Formats data ready for presenting in the `/search-crn` page
 *
 * @param {object} [data] - The customer found by the search, if any
 * @param {string} [payload] - The CRN the user searched for
 *
 * @returns {object} The page data for the view
 */
const searchCrnPresenter = (data, payload) => {
  const { addressLines, postcode } = formatAddressLines(data?.address)
  const resultText = data
    ? `1 result for "${payload}"`
    : `0 results for "${payload}"`

  return {
    clearSearchLink: SEARCH_CRN,
    customerName: data?.customerName || '',
    customerAddress: addressLines,
    customerPostcode: postcode,
    crn: payload ?? '',
    resultText,
    showResults: true,
    showCustomerDetails: Boolean(data),
    showClear: true
  }
}

export {
  searchCrnPresenter
}
