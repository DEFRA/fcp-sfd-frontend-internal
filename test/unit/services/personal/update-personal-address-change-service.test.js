// Test framework dependencies
import { describe, test, expect, beforeEach, vi } from 'vitest'

// Things we need to mock
import { constants, mutations, services } from '@defra/fcp-sfd-frontend-engine'
import { fetchPersonalChangeService } from '../../../../src/services/personal/fetch-personal-change-service.js'
import { flashNotification } from '../../../../src/utils/notifications/flash-notification.js'
import { updateDalService } from '../../../../src/services/DAL/update-dal-service.js'

// Test helpers
import { getMappedData } from '../../../mocks/mock-personal-details.js'

// Thing under test
import { updatePersonalAddressChangeService } from '../../../../src/services/personal/update-personal-address-change-service.js'

// Mocks
vi.mock('../../../../src/services/personal/fetch-personal-change-service.js', () => ({
  fetchPersonalChangeService: vi.fn()
}))

vi.mock('../../../../src/utils/notifications/flash-notification.js', () => ({
  flashNotification: vi.fn()
}))

vi.mock('../../../../src/services/DAL/update-dal-service.js', () => ({
  updateDalService: vi.fn().mockResolvedValue({})
}))

vi.mock('@defra/fcp-sfd-frontend-engine', () => ({
  constants: {
    successMessages: { PERSONAL_ADDRESS: 'You have updated your personal address' }
  },
  mutations: {
    updateCustomerAddress: 'UPDATE_CUSTOMER_ADDRESS_MUTATION'
  },
  services: {
    buildUprnAddress: vi.fn(),
    buildManualAddress: vi.fn()
  }
}))

describe('updatePersonalAddressChangeService', () => {
  let yar
  let crn
  let email
  let data

  beforeEach(() => {
    vi.clearAllMocks()

    crn = '123456890'
    email = 'test@example.com'
    data = getMappedData()
    data.changePersonalAddress = {
      address1: 'A different address',
      city: 'Maidstone',
      postcode: 'BA123 ABC',
      country: 'United Kingdom'
    }

    fetchPersonalChangeService.mockReturnValue(data)

    yar = {
      clear: vi.fn()
    }

    // Mock the address builders
    services.buildUprnAddress.mockImplementation((change) => ({
      pafOrganisationName: change.pafOrganisationName || null,
      buildingNumberRange: change.buildingNumberRange || null,
      buildingName: change.buildingName || null,
      flatName: change.flatName || null,
      street: change.street || null,
      dependentLocality: change.dependentLocality || null,
      doubleDependentLocality: change.doubleDependentLocality || null,
      county: change.county || null,
      uprn: change.uprn || null,
      line1: change.line1 || null,
      line2: change.line2 || null,
      line3: change.line3 || null,
      line4: change.line4 || null,
      line5: change.line5 || null,
      city: change.city || null,
      postalCode: change.postcode || null,
      country: change.country || null
    }))

    services.buildManualAddress.mockImplementation((change) => ({
      pafOrganisationName: change.pafOrganisationName || null,
      buildingNumberRange: change.buildingNumberRange || null,
      buildingName: change.buildingName || null,
      flatName: change.flatName || null,
      street: change.street || null,
      dependentLocality: change.dependentLocality || null,
      doubleDependentLocality: change.doubleDependentLocality || null,
      county: change.county || null,
      uprn: null,
      line1: change.address1 || null,
      line2: change.address2 || null,
      line3: change.address3 || null,
      line4: change.address4 || null,
      line5: change.address5 || null,
      city: change.city || null,
      postalCode: change.postcode || null,
      country: change.country || null
    }))
  })

  describe('when called with a manually entered address', () => {
    test('it fetches personal details from the service', async () => {
      await updatePersonalAddressChangeService(yar, crn, email)

      expect(fetchPersonalChangeService).toHaveBeenCalledWith(yar, crn, email, 'changePersonalAddress')
    })

    test('it calls the updateDalService with correct mutation and variables', async () => {
      await updatePersonalAddressChangeService(yar, crn, email)

      expect(updateDalService).toHaveBeenCalledWith(mutations.updateCustomerAddress, {
        input: {
          crn: '123456890',
          address: {
            pafOrganisationName: null,
            buildingNumberRange: null,
            buildingName: null,
            flatName: null,
            street: null,
            dependentLocality: null,
            doubleDependentLocality: null,
            county: null,
            uprn: null,
            line1: 'A different address',
            line2: null,
            line3: null,
            line4: null,
            line5: null,
            city: 'Maidstone',
            postalCode: 'BA123 ABC',
            country: 'United Kingdom'
          }
        }
      }, email)
    })

    test('adds a flash notification confirming the change in data', async () => {
      await updatePersonalAddressChangeService(yar, crn, email)

      expect(flashNotification).toHaveBeenCalledWith(
        yar,
        'Success',
        constants.successMessages.PERSONAL_ADDRESS
      )
    })

    test('it clears personalDetailsUpdate from session', async () => {
      await updatePersonalAddressChangeService(yar, crn, email)

      expect(yar.clear).toHaveBeenCalledWith('personalDetailsUpdate')
    })
  })

  describe('when called with a lookup (UPRN) address', () => {
    beforeEach(() => {
      data.changePersonalAddress = {
        uprn: '1234567890',
        buildingName: 'Test House',
        city: 'London',
        postcode: 'W1A 1AA',
        country: 'United Kingdom'
      }
    })

    test('it calls the updateDalService with correct lookup variables', async () => {
      await updatePersonalAddressChangeService(yar, crn, email)

      expect(updateDalService).toHaveBeenCalledWith(mutations.updateCustomerAddress, {
        input: {
          crn: '123456890',
          address: {
            pafOrganisationName: null,
            buildingNumberRange: null,
            buildingName: 'Test House',
            flatName: null,
            street: null,
            city: 'London',
            county: null,
            postalCode: 'W1A 1AA',
            country: 'United Kingdom',
            dependentLocality: null,
            doubleDependentLocality: null,
            line1: null,
            line2: null,
            line3: null,
            line4: null,
            line5: null,
            uprn: '1234567890'
          }
        }
      }, email)
    })
  })

  describe('when there is no changePersonalAddress in session data', () => {
    beforeEach(() => {
      data.changePersonalAddress = undefined
    })

    test('it returns early and does not call updateDalService', async () => {
      await updatePersonalAddressChangeService(yar, crn, email)

      expect(updateDalService).not.toHaveBeenCalled()
    })

    test('it does not add a flash notification', async () => {
      await updatePersonalAddressChangeService(yar, crn, email)

      expect(flashNotification).not.toHaveBeenCalled()
    })

    test('it does not clear personalDetailsUpdate from session', async () => {
      await updatePersonalAddressChangeService(yar, crn, email)

      expect(yar.clear).not.toHaveBeenCalled()
    })
  })
})
