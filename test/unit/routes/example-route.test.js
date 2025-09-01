import { vi, describe, test, expect, beforeEach } from 'vitest'
import { constants as httpConstants } from 'node:http2'
import { exampleDalConnectionRoute } from '../../../src/routes/business/example-routes.js'
import { dalConnector } from '../../../src/dal/connector'

vi.mock('../../../src/dal/connector.js', () => {
  return {
    dalConnector: vi.fn()
  }
})

describe('example DAL connection route', () => {
  const mockResponse = {
    code: vi.fn().mockReturnThis()
  }

  const mockH = {
    response: vi.fn().mockReturnValue(mockResponse)
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('should return success response when dalConnector returns data', async () => {
    dalConnector.mockResolvedValue({
      data: {
        business: {
          sbi: 123456789,
          info: {
            name: 'Test Business'
          }
        }
      },
      errors: null
    })

    const response = await exampleDalConnectionRoute.handler(null, mockH)

    expect(dalConnector).toHaveBeenCalled()

    expect(mockH.response).toHaveBeenCalledWith({
      message: 'success',
      data: {
        business: {
          sbi: 123456789,
          info: {
            name: 'Test Business'
          }
        }
      }
    })

    expect(mockResponse.code).toHaveBeenCalledWith(httpConstants.HTTP_STATUS_OK)
    expect(response).toBe(mockResponse)
  })

  test('should return error response when dalConnector returns errors', async () => {
    const error = {
      message: 'Not Found',
      extensions: {
        code: 'NOT_FOUND'
      }
    }

    dalConnector.mockResolvedValue({
      data: null,
      errors: [error],
      statusCode: 404
    })

    const response = await exampleDalConnectionRoute.handler(null, mockH)

    expect(dalConnector).toHaveBeenCalled()

    expect(mockH.response).toHaveBeenCalledWith({
      data: null,
      errors: [{
        message: 'Not Found',
        code: 'NOT_FOUND'
      }]
    })

    expect(mockResponse.code).toHaveBeenCalledWith(httpConstants.HTTP_STATUS_NOT_FOUND)
    expect(response).toBe(mockResponse)
  })
})
