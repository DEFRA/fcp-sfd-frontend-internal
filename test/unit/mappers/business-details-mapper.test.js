import { describe, test, expect } from 'vitest'
import { dalData, mappedData } from '../../mocks/mock-business-details.js'

const { mapBusinessDetails } = await import('../../../src/mappers/business-details-mapper.js')

describe('businessDetailsMapper', () => {
  describe('when given valid raw DAL data ', () => {
    test('it should map the values to the correct format ', () => {
      const result = mapBusinessDetails(dalData)
      expect(result).toEqual(mappedData)
    })

    test('it should build the fullname correctly ', () => {
      const fullNameCheckData = {
        ...dalData,
        customer: {
          info: {
            name: {
              first: 'Software',
              last: 'Developer',
              title: 'Mr.'
            }
          }
        }
      }

      const result = mapBusinessDetails(fullNameCheckData)

      expect(result.customer.fullName).toEqual('Mr. Software Developer')
    })
  })
})
