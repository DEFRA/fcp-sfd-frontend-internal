import { vi, describe, test, expect, beforeEach } from 'vitest'

const mockPutMetric = vi.fn()
const mockFlush = vi.fn().mockResolvedValue(undefined)
const mockLoggerError = vi.fn()

vi.mock('aws-embedded-metrics', () => {
  return {
    createMetricsLogger: () => ({
      putMetric: mockPutMetric,
      flush: mockFlush
    }),
    Unit: {
      Count: 'Count'
    },
    StorageResolution: {
      Standard: 'Standard'
    }
  }
})

vi.mock('../../../src/utils/logger.js', () => ({
  createLogger: () => ({
    error: (...args) => mockLoggerError(...args)
  })
}))

const { config } = await import('../../../src/config/index.js')
const { metricsCounter } = await import('../../../src/utils/metrics.js')
const { Unit, StorageResolution } = await import('aws-embedded-metrics')

const mockMetricsName = 'mock-metrics-name'
const defaultMetricsValue = 1
const mockValue = 200

describe('#metrics', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockPutMetric.mockClear()
    mockFlush.mockClear()
    mockLoggerError.mockClear()
  })

  describe('When metrics is not enabled', () => {
    beforeEach(async () => {
      config.set('server.isMetricsEnabled', false)
      await metricsCounter(mockMetricsName, mockValue)
    })

    test('Should not call metric', () => {
      expect(mockPutMetric).not.toHaveBeenCalled()
    })

    test('Should not call flush', () => {
      expect(mockFlush).not.toHaveBeenCalled()
    })
  })

  describe('When metrics is enabled', () => {
    beforeEach(() => {
      config.set('server.isMetricsEnabled', true)
    })

    test('Should send metric with default value', async () => {
      await metricsCounter(mockMetricsName)

      expect(mockPutMetric).toHaveBeenCalledWith(
        mockMetricsName,
        defaultMetricsValue,
        Unit.Count,
        StorageResolution.Standard
      )
    })

    test('Should send metric', async () => {
      await metricsCounter(mockMetricsName, mockValue)

      expect(mockPutMetric).toHaveBeenCalledWith(
        mockMetricsName,
        mockValue,
        Unit.Count,
        StorageResolution.Standard
      )
    })

    test('Should call flush', async () => {
      await metricsCounter(mockMetricsName, mockValue)

      expect(mockFlush).toHaveBeenCalledTimes(1)
    })
  })

  describe('When metrics throws', () => {
    const mockError = new Error('mock-metrics-put-error')

    beforeEach(async () => {
      config.set('server.isMetricsEnabled', true)

      mockFlush.mockRejectedValue(mockError)

      await metricsCounter(mockMetricsName, mockValue)
    })

    test('Should log expected error', () => {
      expect(mockLoggerError).toHaveBeenCalledWith(
        expect.any(Error),
        mockError.message
      )
    })
  })
})
