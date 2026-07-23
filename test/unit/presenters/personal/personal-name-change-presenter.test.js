// Test framework dependencies
import { describe, test, expect, beforeEach } from 'vitest'

// Thing under test
import { personalNameChangePresenter } from '../../../../src/presenters/personal/personal-name-change-presenter.js'

describe('personalNameChangePresenter', () => {
  let data
  let payload
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
      },
      changePersonalName: {}
    }
  })

  describe('when provided with personal name change data', () => {
    test('it correctly presents the data', () => {
      const result = personalNameChangePresenter(data, undefined, crn)

      expect(result).toEqual({
        backLink: { href: '/customer/1234567890/details' },
        pageTitle: 'What is your full name?',
        metaDescription: 'Update the full name for your personal account.',
        userName: 'John Doe',
        first: 'John',
        middle: 'M',
        last: 'Doe'
      })
    })
  })

  describe('the "userName" property', () => {
    describe('when the userName property is missing', () => {
      beforeEach(() => {
        delete data.info.userName
      })

      test('it should return userName as null', () => {
        const result = personalNameChangePresenter(data, undefined, crn)

        expect(result.userName).toEqual(null)
      })
    })
  })

  describe('the "first" property', () => {
    describe('when provided with a payload', () => {
      beforeEach(() => {
        payload = { first: 'Jane' }
      })

      test('it should return the payload as the first property', () => {
        const result = personalNameChangePresenter(data, payload, crn)

        expect(result.first).toEqual('Jane')
      })
    })

    describe('when no payload is provided but a changed first name', () => {
      beforeEach(() => {
        data.changePersonalName.first = 'Jack'
      })

      test('it should return the changed name as the first property', () => {
        const result = personalNameChangePresenter(data, undefined, crn)

        expect(result.first).toEqual('Jack')
      })
    })

    describe('when no payload and no changed name is provided', () => {
      beforeEach(() => {
        delete data.changePersonalName.first
        payload = {}
      })

      test('it should default to the original first name', () => {
        const result = personalNameChangePresenter(data, payload, crn)

        expect(result.first).toEqual('John')
      })
    })
  })

  describe('the "middle" property', () => {
    describe('when provided with a payload', () => {
      beforeEach(() => {
        payload = { middle: 'P' }
      })

      test('it should return the payload as the middle property', () => {
        const result = personalNameChangePresenter(data, payload, crn)

        expect(result.middle).toEqual('P')
      })
    })

    describe('when no payload is provided but a changed middle names', () => {
      beforeEach(() => {
        data.changePersonalName.middle = 'A'
      })

      test('it should return the changed name as the middle property', () => {
        const result = personalNameChangePresenter(data, undefined, crn)

        expect(result.middle).toEqual('A')
      })
    })

    describe('when no payload and no changed name is provided', () => {
      beforeEach(() => {
        delete data.changePersonalName.middle
        payload = {}
      })

      test('it should default to the original middle names', () => {
        const result = personalNameChangePresenter(data, payload, crn)

        expect(result.middle).toEqual('M')
      })
    })
  })

  describe('the "last" property', () => {
    describe('when provided with a payload', () => {
      beforeEach(() => {
        payload = { last: 'Smith' }
      })

      test('it should return last as the payload', () => {
        const result = personalNameChangePresenter(data, payload, crn)

        expect(result.last).toEqual('Smith')
      })
    })

    describe('when no payload is provided but a changed last name', () => {
      beforeEach(() => {
        data.changePersonalName.last = 'Jones'
      })

      test('it should return the changed name as the last property', () => {
        const result = personalNameChangePresenter(data, undefined, crn)

        expect(result.last).toEqual('Jones')
      })
    })

    describe('when no payload and no changed name is provided', () => {
      beforeEach(() => {
        delete data.changePersonalName.last
        payload = {}
      })

      test('it should default to the original last name', () => {
        const result = personalNameChangePresenter(data, payload, crn)

        expect(result.last).toEqual('Doe')
      })
    })
  })

  describe('the "backLink" property', () => {
    describe('when a crn is provided', () => {
      test('it should link to the customer details page', () => {
        const result = personalNameChangePresenter(data, undefined, crn)

        expect(result.backLink).toEqual({ href: '/customer/1234567890/details' })
      })
    })

    describe('when a crn is not provided', () => {
      test('it should link to the search-crn page', () => {
        const result = personalNameChangePresenter(data, undefined, undefined)

        expect(result.backLink).toEqual({ href: '/search-crn' })
      })
    })
  })
})
