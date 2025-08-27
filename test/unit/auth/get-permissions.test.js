import { vi, beforeEach, describe, test, expect } from 'vitest'
import { dalData, mappedData } from '../../mocks/mock-permissions.js'
import { dalConnector } from '../../../src/dal/connector.js'
import { mapPermissions } from '../../../src/mappers/permissions-mapper.js'
import { permissionsQuery } from '../../../src/dal/queries/permissions-query.js'

const mockConfigGet = vi.fn()

vi.mock('../../../src/dal/connector.js', () => ({
  dalConnector: vi.fn()
}))

vi.mock('../../../src/mappers/permissions-mapper.js', () => ({
  mapPermissions: vi.fn()
}))

vi.mock('../../../src/dal/queries/permissions-query.js', () => ({
  permissionsQuery: vi.fn()
}))

vi.mock('../../../src/config/index.js', () => ({
  config: {
    get: mockConfigGet
  }
}))

const { getPermissions } = await import('../../../src/auth/get-permissions.js')
let sbi
let crn

describe('getPermissions', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    sbi = '234654278765'
    crn = '987645433252'

    mockConfigGet.mockReturnValue(true)
    mapPermissions.mockReturnValue(mappedData)
    dalConnector.mockResolvedValue({ data: dalData })
  })

  describe('when DAL_CONNECTION is true', () => {
    beforeEach(() => {
      mockConfigGet.mockReturnValue(true)
    })
    test('should call dalConnector with getPermission parameters', async () => {
      await getPermissions(sbi, crn)
      expect(dalConnector).toHaveBeenCalledWith(permissionsQuery, { sbi, crn })
    })
    test('should call mapPermissions when dalConnector response has data', async () => {
      await getPermissions(sbi, crn)
      expect(mapPermissions).toHaveBeenCalledWith(dalData)
    })

    test('should return mapped data  when dalConnector response has data', async () => {
      const result = await getPermissions(sbi, crn)
      expect(result).toBe(mappedData)
    })

    test('should not call mapPermissions when dalConnector response has no data', async () => {
      dalConnector.mockResolvedValue({})
      await getPermissions(sbi, crn)
      expect(mapPermissions).not.toHaveBeenCalled()
    })

    test('should return dalConnector response when dalConnector response has no data', async () => {
      const dalResponse = { response: 'no-dal-data' }
      dalConnector.mockResolvedValue(dalResponse)
      const result = await getPermissions(sbi, crn)
      expect(result).toBe(dalResponse)
    })
  })

  describe('when DAL_CONNECTION is false', () => {
    beforeEach(() => {
      mockConfigGet.mockReturnValue(false)
    })
    test('dalConnector is not called', async () => {
      await getPermissions(sbi, crn)
      expect(dalConnector).not.toHaveBeenCalled()
    })

    test('it correctly returns data static data source', async () => {
      const result = await getPermissions(sbi, crn)
      expect(result).toMatchObject(mappedData)
    })
  })
})
