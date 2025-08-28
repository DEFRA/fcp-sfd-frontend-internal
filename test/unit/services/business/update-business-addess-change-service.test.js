// Test framework dependencies
import { describe, test, expect, beforeEach, vi } from 'vitest'

// Things we need to mock
import { fetchBusinessDetailsService } from '../../../../src/services/business/fetch-business-details-service'
import { flashNotification } from '../../../../src/utils/notifications/flash-notification.js'

// Test helpers
import { mappedData } from '../../../mocks/mock-business-details.js'

// Thing under test
import { updateBusinessAddressChangeService } from '../../../../src/services/business/update-business-address-change-service.js'

// Mocks
vi.mock('../../../../src/services/business/fetch-business-details-service', () => ({
  fetchBusinessDetailsService: vi.fn()
}))

vi.mock('../../../../src/utils/notifications/flash-notification.js', () => ({
  flashNotification: vi.fn()
}))

describe('updateBusinessAddressChangeService', () => {
  let yar
  let credentials

  beforeEach(() => {
    vi.clearAllMocks()

    mappedData.changeBusinessAddress = {
      address1: 'A different address',
      city: 'Maidstone',
      postcode: 'BA123 ABC',
      country: 'United Kingdom'
    }

    fetchBusinessDetailsService.mockReturnValue(mappedData)
    yar = {
      set: vi.fn().mockReturnValue()
    }
    credentials = { sbi: '123456789', crn: '987654321', email: 'test@example.com' }
  })

  describe('when called', () => {
    test('it correctly saves the data to the session', async () => {
      await updateBusinessAddressChangeService(yar, credentials)

      expect(fetchBusinessDetailsService).toHaveBeenCalledWith(yar, credentials)
      expect(yar.set).toHaveBeenCalledWith('businessDetails', savedData())
    })

    test('adds a flash notification confirming the change in data', async () => {
      await updateBusinessAddressChangeService(yar, credentials)

      expect(flashNotification).toHaveBeenCalledWith(yar, 'Success', 'You have updated your business address')
    })
  })
})

const savedData = () => {
  return {
    address: {
      country: 'United Kingdom',
      lookup: {
        buildingName: null,
        buildingNumberRange: null,
        city: null,
        county: null,
        flatName: null,
        street: null
      },
      manual: {
        line1: 'A different address',
        line2: null,
        line3: 'Child Okeford',
        line4: 'Maidstone',
        line5: null
      },
      postcode: 'BA123 ABC'
    },
    contact: {
      email: 'henleyrej@eryelnehk.com.test',
      landline: '01234031859',
      mobile: null
    },
    customer: {
      fullName: 'Mrs. Ingrid Jerimire Klaufichious Limouhetta Mortimious Neuekind Orpheus Perimillian Quixillotrio Reviticlese Cook'
    },
    info: {
      businessName: 'HENLEY, RE',
      countyParishHoldingNumbers: [{ cphNumber: '12/123/1234' }],
      legalStatus: 'Sole Proprietorship',
      sbi: '107183280',
      traderNumber: '010203040506070880980',
      type: 'Not Specified',
      vat: 'GB123456789',
      vendorNumber: '694523'
    }
  }
}
