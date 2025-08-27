import { describe, test, expect } from 'vitest'
import { getNavigationItems } from '../../../../src/config/navigation-items.js'

const createMockRequest = (testPath) => {
  return { path: testPath }
}

describe('#buildNavigation', () => {
  test('Should provide expected navigation details', () => {
    expect(getNavigationItems(createMockRequest('/non-existent-path'))).toEqual(
      [
        {
          isActive: false,
          text: 'Home',
          url: '/'
        }
      ]
    )
  })

  test('Should provide expected highlighted navigation details', () => {
    expect(getNavigationItems(createMockRequest('/'))).toEqual([
      {
        isActive: true,
        text: 'Home',
        url: '/'
      }
    ])
  })
})
