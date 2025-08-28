import { vi, beforeEach, describe, test, expect } from 'vitest'
import { homeRoutes } from '../../../src/routes/home-routes.js'

const [index, home] = homeRoutes

const mockView = vi.fn()

const mockH = {
  view: vi.fn().mockReturnValue(mockView)
}

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

describe('Home endpoint', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('should have the correct method and path', () => {
    expect(home.method).toBe('GET')
    expect(home.path).toBe('/home')
  })

  test('should render the home view with correct data', () => {
    const result = home.handler(null, mockH)

    expect(mockH.view).toHaveBeenCalledWith('home')
    expect(result).toBe(mockView)
  })
})
