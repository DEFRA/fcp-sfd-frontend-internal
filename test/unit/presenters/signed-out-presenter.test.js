// Test framework dependencies
import { describe, test, expect } from 'vitest'

// Thing under test
import { signedOutPresenter } from '../../../src/presenters/signed-out-presenter'

describe('signedOutPresenter', () => {
  test('it correctly presents the data', () => {
    const result = signedOutPresenter()

    expect(result).toEqual({
      pageTitle: 'You have signed out',
      metaDescription: 'If this is not what you wanted, you can',
      signInText: 'sign back into Manage your land and farm businesses',
      signInLink: '/auth/sign-in'
    })
  })
})
