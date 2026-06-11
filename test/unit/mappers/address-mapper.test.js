// Test framework dependencies
import { describe, test, expect } from 'vitest'

// Thing under test
import { mapAddress } from '../../../src/mappers/address-mapper.js'

// Test helpers
import { getMappedData as getCustomerMappedData } from '../../mocks/mock-customer-details-by-crn.js'
import { getMappedData as getBusinessMappedData } from '../../mocks/mock-business-details-by-sbi.js'

describe('address mapper', () => {
  test('it maps all fields correctly', () => {
    const address = {
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

    const result = mapAddress(address)

    expect(result).toEqual(getCustomerMappedData().address)
  })

  test('it maps extra lookup fields when provided', () => {
    const address = {
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

    const result = mapAddress(address, {
      pafOrganisationName: address.pafOrganisationName
    })

    expect(result).toEqual(getBusinessMappedData().address)
  })

  test('it maps postalCode to postcode', () => {
    const result = mapAddress({ postalCode: 'EX1 2AB' })

    expect(result.postcode).toEqual('EX1 2AB')
  })

  test('it maps an empty address object without crashing', () => {
    const result = mapAddress({})

    expect(result.lookup).toEqual({
      buildingNumberRange: undefined,
      flatName: undefined,
      buildingName: undefined,
      dependentLocality: undefined,
      doubleDependentLocality: undefined,
      street: undefined,
      county: undefined,
      uprn: undefined
    })
    expect(result.manual).toEqual({
      line1: undefined,
      line2: undefined,
      line3: undefined,
      line4: undefined,
      line5: undefined
    })
    expect(result.city).toEqual(undefined)
    expect(result.postcode).toEqual(undefined)
    expect(result.country).toEqual(undefined)
  })
})
