/**
 * Formats data ready for presenting in the `/search-sbi` page
 * @module searchSbiPresenter
 */

import { formatAddressLines } from '../base-presenter.js'
import { SEARCH_SBI } from '../../constants/search-links.js'

const searchSbiPresenter = (businessDetails, payload) => {
  const { addressLines, postcode } = formatAddressLines(businessDetails?.address)
  const resultText = businessDetails
    ? `1 result for "${payload}"`
    : `0 results for "${payload}"`

  return {
    businessName: businessDetails?.info?.businessName || '',
    businessTraderNumber: businessDetails?.info?.traderNumber || '',
    businessVendorNumber: businessDetails?.info?.vendorNumber || '',
    businessAddress: addressLines,
    businessPostcode: postcode,
    clearSearchLink: SEARCH_SBI,
    resultText,
    showResults: true,
    showBusinessDetails: Boolean(businessDetails),
    showClear: true,
    sbi: payload ?? ''
  }
}

export {
  searchSbiPresenter
}
