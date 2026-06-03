/**
 * Test-only fixture helpers for SBI business details.
 * Returns fresh objects so tests can safely mutate values in beforeEach blocks.
 *
 * @module mockBusinessDetailsBySbi
 */

const getDalData = () => ({
  business: {
    sbi: '106705779',
    info: {
      name: 'Herberts Lawn Mowing',
      traderNumber: '876432',
      vendorNumber: '673920',
      address: {
        pafOrganisationName: 'Herberts Lawn Mowing Ltd',
        buildingNumberRange: '14',
        flatName: 'Flat 2',
        buildingName: 'The Lawn Building',
        dependentLocality: 'Taunton Borough',
        doubleDependentLocality: 'Chip Lane Area',
        street: 'Chip Lane',
        county: 'Somerset',
        uprn: '100012345678',
        line1: '14 Chip Lane',
        line2: 'Taunton Sorting Office',
        line3: null,
        line4: 'Somerset',
        line5: null,
        city: 'Taunton',
        postalCode: 'TA1 1AA',
        country: 'England'
      }
    }
  }
})

const getMappedData = () => ({
  info: {
    sbi: '106705779',
    businessName: 'Herberts Lawn Mowing',
    traderNumber: '876432',
    vendorNumber: '673920'
  },
  address: {
    lookup: {
      pafOrganisationName: 'Herberts Lawn Mowing Ltd',
      buildingNumberRange: '14',
      flatName: 'Flat 2',
      buildingName: 'The Lawn Building',
      dependentLocality: 'Taunton Borough',
      doubleDependentLocality: 'Chip Lane Area',
      street: 'Chip Lane',
      county: 'Somerset',
      uprn: '100012345678'
    },
    manual: {
      line1: '14 Chip Lane',
      line2: 'Taunton Sorting Office',
      line3: null,
      line4: 'Somerset',
      line5: null
    },
    city: 'Taunton',
    postcode: 'TA1 1AA',
    country: 'England'
  }
})

export {
  getDalData,
  getMappedData
}
