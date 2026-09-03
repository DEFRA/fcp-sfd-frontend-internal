/**
 * Formats data ready for presenting in the `/search-crn` page
 * @module searchCrnPresenter
 */

import { formatAddressLines } from '../base-presenter.js'
import { SEARCH_CRN } from '../../constants/search-links.js'

const searchCrnPresenter = (customerDetails, payload) => {
  const { addressLines, postcode } = formatAddressLines(customerDetails?.address)
  const resultText = customerDetails
    ? `1 result for "${payload}"`
    : `0 results for "${payload}"`

  return {
    clearSearchLink: SEARCH_CRN,
    customerName: customerDetails?.info?.customerName || '',
    customerAddress: addressLines,
    customerPostcode: postcode,
    crn: payload ?? '',
    resultText,
    showResults: true,
    showCustomerDetails: Boolean(customerDetails),
    showClear: true
  }
}

export {
  searchCrnPresenter
}
