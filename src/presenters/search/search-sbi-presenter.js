/**
 * Formats data ready for presenting in the `/search-sbi` page
 * @module searchSbiPresenter
 */

import { formatAddressLines } from '../base-presenter.js'
import { SEARCH_SBI } from '../../constants/search-links.js'

const searchSbiPresenter = (data, payload) => {
  const { addressLines, postcode } = formatAddressLines(data?.address)
  const resultText = data
    ? `1 result for "${payload}"`
    : `0 results for "${payload}"`

  return {
    businessName: data?.businessName || '',
    businessTraderNumber: data?.traderNumber || '',
    businessVendorNumber: data?.vendorNumber || '',
    businessAddress: addressLines,
    businessPostcode: postcode,
    clearSearchLink: SEARCH_SBI,
    resultText,
    showResults: true,
    showBusinessDetails: Boolean(data),
    showClear: true,
    sbi: payload ?? ''
  }
}

export {
  searchSbiPresenter
}
