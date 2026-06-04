/**
 * Formats data ready for presenting in the `/search-crn` page
 * @module searchCrnPresenter
 */

const searchCrnPresenter = (customerDetails, payload) => {
  const { addressLines, postcode } = getFormattedAddress(customerDetails?.address)
  const resultText = customerDetails ? `1 result for "${payload}"` : '0 results'

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

// Returns the address lines as a single string and the postcode separately.
// The view renders postcode on its own line beneath the rest of the address.
const getFormattedAddress = (address) => {
  if (!address) {
    return { addressLines: '', postcode: '' }
  }

  const lookup = address.lookup || {}
  const manual = address.manual || {}
  const postcode = address.postcode || ''
  const country = address.country || ''
  const city = address.city || ''

  let lines = []

  if (lookup.uprn) {
    // The user selected an address from the lookup tool
    const buildingAndStreet = [lookup.buildingNumberRange, lookup.street]
      .filter(Boolean)
      .join(' ')

    lines = [
      lookup.flatName,
      lookup.buildingName,
      buildingAndStreet,
      lookup.doubleDependentLocality,
      lookup.dependentLocality,
      city,
      lookup.county,
      country
    ]
  } else {
    // The user typed their address in manually
    lines = [
      manual.line1,
      manual.line2,
      manual.line3,
      city,
      manual.line4, // County
      manual.line5,
      country
    ]
  }

  return {
    addressLines: lines.filter(Boolean).join(', '),
    postcode: postcode || ''
  }
}

export {
  searchCrnPresenter
}
