// Test framework dependencies
import { describe, test, expect, beforeEach } from 'vitest'

// Thing under test
import { personalNameCheckPresenter } from '../../../../src/presenters/personal/personal-name-check-presenter.js'

describe('personalNameCheckPresenter', () => {
  let data
  const crn = '1234567890'

  beforeEach(() => {
    data = {
      info: {
        userName: 'John Doe',
        fullName: {
          first: 'John',
          middle: 'M',
          last: 'Doe'
        }
      }
    }
  })

  describe('when provided with personal name check data', () => {
    test('it correctly presents the data', () => {
      const result = personalNameCheckPresenter(data, crn)

      expect(result).toEqual({
        backLink: { href: '/customer/1234567890/account-name-change' },
        changeLink: '/customer/1234567890/account-name-change',
        pageTitle: 'Check your name is correct before submitting',
        metaDescription: 'Check the full name for your personal account is correct.',
        userName: 'John Doe',
        fullName: 'John M Doe'
      })
    })
  })

  describe('the "userName" property', () => {
    describe('when the userName property is missing', () => {
      beforeEach(() => {
        delete data.info.userName
      })

      test('it should return userName as null', () => {
        const result = personalNameCheckPresenter(data, crn)

        expect(result.userName).toEqual(null)
      })
    })
  })

  describe('the "fullName" property', () => {
    describe('when provided with a changed personal name', () => {
      beforeEach(() => {
        data.changePersonalName = {
          first: 'Jane',
          middle: 'A',
          last: 'Smith'
        }
      })

      test('it should return the changed name as the fullName property', () => {
        const result = personalNameCheckPresenter(data, crn)

        expect(result.fullName).toEqual('Jane A Smith')
      })
    })

    describe('when changePersonalName is missing', () => {
      beforeEach(() => {
        delete data.changePersonalName
      })

      test('it should default to the original name', () => {
        const result = personalNameCheckPresenter(data, crn)

        expect(result.fullName).toEqual('John M Doe')
      })
    })
  })
})
