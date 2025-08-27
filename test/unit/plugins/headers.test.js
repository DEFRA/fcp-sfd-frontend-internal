import { describe, test, expect } from 'vitest'
import { headersPlugin } from '../../../src/plugins/headers.js'

describe('headers', () => {
  test('should return an object', () => {
    expect(headersPlugin).toBeInstanceOf(Object)
  })

  test('should name the plugin', () => {
    expect(headersPlugin.plugin.name).toBe('headers')
  })

  test('should have a register function', () => {
    expect(headersPlugin.plugin.register).toBeInstanceOf(Function)
  })
})
