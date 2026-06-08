/**
 * Formats data ready for presenting in the `/search-crn` page
 * @module searchCrnPresenter
 */

import { formatAddressLines } from '../base-presenter.js'

const searchCrnPresenter = (customerDetails, payload) => {
  const { addressLines, postcode } = formatAddressLines(customerDetails?.address)
  const resultText = customerDetails
    ? `1 result for "${payload}"`
    : `0 results for "${payload}"`

  return {
    customerName: customerDetails?.info?.customerName || '',
    customerAddress: addressLines,
    customerPostcode: postcode,
    resultText,
    showResults: true,
    showCustomerDetails: Boolean(customerDetails),
    showClear: true,
    crn: payload ?? ''
  }
}

export {
  searchCrnPresenter
}
