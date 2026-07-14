// Test framework dependencies
import { vi, beforeEach, describe, test, expect } from 'vitest'

// Thing under test
import { index } from '../../../src/routes/index-routes.js'

describe('Root endpoint', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('should return an object', () => {
    expect(index).toBeInstanceOf(Object)
  })

  test('should return GET / route', () => {
    expect(index.method).toBe('GET')
    expect(index.path).toBe('/')
  })

  test('should try and authenticate using default strategy', () => {
    expect(index.options.auth.strategy).toBeUndefined()
    expect(index.options.auth.mode).toBe('try')
  })

  test('should have a handler', () => {
    expect(index.handler).toBeInstanceOf(Function)
  })
})
