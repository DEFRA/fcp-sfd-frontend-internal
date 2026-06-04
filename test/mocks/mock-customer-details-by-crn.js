/**
 * Test-only fixture helpers for CRN customer details.
 * Returns fresh objects so tests can safely mutate values in beforeEach blocks.
 *
 * @module mockCustomerDetailsByCrn
 */

const getDalData = () => ({
  customer: {
    crn: '1234567890',
    info: {
      name: {
        first: 'Jane',
        last: 'Smith'
      },
      address: {
        buildingNumberRange: '12',
        flatName: 'Flat 1',
        buildingName: 'The Farm House',
        dependentLocality: 'West Fields',
        doubleDependentLocality: 'Rural Area',
        street: 'Farm Lane',
        county: 'Devon',
        uprn: '200023456789',
        line1: '12 Farm Lane',
        line2: 'West Fields',
        line3: null,
        line4: 'Devon',
        line5: null,
        city: 'Exeter',
        postalCode: 'EX1 1AA',
        country: 'England'
      }
    }
  }
})

const getMappedData = () => ({
  info: {
    crn: '1234567890',
    customerName: 'Jane Smith'
  },
  address: {
    lookup: {
      buildingNumberRange: '12',
      flatName: 'Flat 1',
      buildingName: 'The Farm House',
      dependentLocality: 'West Fields',
      doubleDependentLocality: 'Rural Area',
      street: 'Farm Lane',
      county: 'Devon',
      uprn: '200023456789'
    },
    manual: {
      line1: '12 Farm Lane',
      line2: 'West Fields',
      line3: null,
      line4: 'Devon',
      line5: null
    },
    city: 'Exeter',
    postcode: 'EX1 1AA',
    country: 'England'
  }
})

export {
  getDalData,
  getMappedData
}
