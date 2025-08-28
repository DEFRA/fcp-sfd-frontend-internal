import { vi, beforeAll, beforeEach, describe, test, expect } from 'vitest'

const mockGetTraceId = vi.fn()

vi.mock('@defra/hapi-tracing', () => ({
  getTraceId: mockGetTraceId
}))

let loggerOptions

beforeAll(async () => {
  const loggerOptionsModule = await import('../../../src/config/logger-options.js')
  loggerOptions = loggerOptionsModule.loggerOptions
})

describe('logger-options', () => {
  beforeEach(() => {
    mockGetTraceId.mockReset()
  })

  test('mixin function adds trace ID when available', () => {
    mockGetTraceId.mockReturnValue('test-trace-id')

    const result = loggerOptions.mixin()

    expect(result).toEqual({
      trace: { id: 'test-trace-id' }
    })
  })

  test('mixin function returns empty object when no trace ID', () => {
    mockGetTraceId.mockReturnValue(null)

    const result = loggerOptions.mixin()

    expect(result).toEqual({})
  })
})
