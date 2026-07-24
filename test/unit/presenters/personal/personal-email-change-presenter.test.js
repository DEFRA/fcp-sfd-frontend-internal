// Test framework dependencies
import { describe, test, expect, beforeEach } from 'vitest'

// Thing under test
import { personalEmailChangePresenter } from '../../../../src/presenters/personal/personal-email-change-presenter.js'

describe('personalEmailChangePresenter', () => {
  let data
  let payload
  const crn = '1234567890'

  beforeEach(() => {
    data = {
      info: {
        userName: 'John Doe',
        fullName: {
          first: 'John',
          last: 'Doe'
        }
      },
      contact: {
        email: 'test@test.com'
      }
    }
  })

  describe('when provided with personal email change data', () => {
    test('it correctly presents the data', () => {
      const result = personalEmailChangePresenter(data, undefined, crn)

      expect(result).toEqual({
        backLink: { href: '/customer/1234567890/details' },
        pageTitle: 'What is your personal email address?',
        metaDescription: 'Update the email address for your personal account.',
        userName: 'John Doe',
        personalEmail: 'test@test.com'
      })
    })
  })

  describe('the "userName" property', () => {
    describe('when the userName property is missing', () => {
      beforeEach(() => {
        delete data.info.userName
      })

      test('it should return userName as null', () => {
        const result = personalEmailChangePresenter(data, undefined, crn)

        expect(result.userName).toEqual(null)
      })
    })
  })

  describe('the "personalEmail" property', () => {
    describe('when provided with a changed personal email', () => {
      beforeEach(() => {
        data.changePersonalEmail = 'new-email@test.com'
      })

      test('it should return the changed personal email as the personalEmail', () => {
        const result = personalEmailChangePresenter(data, undefined, crn)

        expect(result.personalEmail).toEqual('new-email@test.com')
      })
    })

    describe('when provided with a payload', () => {
      beforeEach(() => {
        payload = 'even-newer-email@test.com'
      })

      test('it should return the payload as the personalEmail', () => {
        const result = personalEmailChangePresenter(data, payload, crn)

        expect(result.personalEmail).toEqual('even-newer-email@test.com')
      })
    })
  })

  describe('the "backLink" property', () => {
    describe('when a crn is provided', () => {
      test('it should link to the customer details page', () => {
        const result = personalEmailChangePresenter(data, undefined, crn)

        expect(result.backLink).toEqual({ href: '/customer/1234567890/details' })
      })
    })

    describe('when a crn is not provided', () => {
      test('it should link to the search-crn page', () => {
        const result = personalEmailChangePresenter(data, undefined, undefined)

        expect(result.backLink).toEqual({ href: '/search-crn' })
      })
    })
  })
})
