/**
 * Formats data ready for presenting in the `/search-sbi` page
 * @module searchSbiPresenter
 */

import { formatAddressLines } from '../base-presenter.js'
import { SEARCH_SBI, CHANGE_SEARCH_CRITERIA } from '../../constants/search-links.js'

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
    changeSearchCriteriaLink: CHANGE_SEARCH_CRITERIA,
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
