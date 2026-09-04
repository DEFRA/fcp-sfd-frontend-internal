/**
 * Formats data ready for presenting in the `/search-crn` page
 * @module searchCrnPresenter
 */

import { formatAddressLines } from '../base-presenter.js'
import { SEARCH_CRN } from '../../constants/search-links.js'

const searchCrnPresenter = (data, payload) => {
  const { addressLines, postcode } = formatAddressLines(data?.address)
  const resultText = data
    ? `1 result for "${payload}"`
    : `0 results for "${payload}"`

  return {
    clearSearchLink: SEARCH_CRN,
    customerName: data?.info?.customerName || '',
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
