import { describe, test, expect } from 'vitest'
import { dalData, mappedData } from '../../mocks/mock-personal-details.js'

const { mapPersonalDetails } = await import('../../../src/mappers/personal-details-mapper.js')

describe('personalDetailsMapper', () => {
  describe('when given valid raw DAL data ', () => {
    test('it should map the values to the correct format ', () => {
      const result = mapPersonalDetails(dalData)

      expect(result).toEqual(mappedData)
    })
  })
})
