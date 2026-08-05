// Test framework dependencies
import { describe, test, expect, beforeEach } from 'vitest'

// Thing under test
import { personalDobCheckPresenter } from '../../../../src/presenters/personal/personal-dob-check-presenter.js'

describe('personalDobCheckPresenter', () => {
  let data
  const crn = '1234567890'

  beforeEach(() => {
    data = {
      info: {
        userName: 'Alfred Waldron',
        fullName: {
          first: 'Alfred',
          last: 'Waldron'
        }
      },
      changePersonalDob: { day: '25', month: '06', year: '1984' }
    }
  })

  describe('when provided with changePersonalDob', () => {
    test('it correctly presents the data', () => {
      const result = personalDobCheckPresenter(data, crn)

      expect(result).toEqual({
        backLink: { href: `/customer/${crn}/account-date-of-birth-change` },
        pageTitle: 'Check your date of birth is correct before submitting',
        metaDescription: 'Check the date of birth for your personal account is correct.',
        userName: 'Alfred Waldron',
        changeLink: `/customer/${crn}/account-date-of-birth-change`,
        dateOfBirth: '25 June 1984'
      })
    })
  })

  describe('the "userName" property', () => {
    describe('when the userName property is missing', () => {
      beforeEach(() => {
        delete data.info.userName
      })

      test('it should return userName as null', () => {
        const result = personalDobCheckPresenter(data, crn)

        expect(result.userName).toEqual(null)
      })
    })
  })

  describe('when there is no changePersonalDob in the session', () => {
    beforeEach(() => {
      delete data.changePersonalDob
      data.info.dateOfBirth = { day: '01', month: '05', year: '1990' }
    })

    test('it falls back to the date of birth on record', () => {
      const result = personalDobCheckPresenter(data, crn)

      expect(result.dateOfBirth).toEqual('1 May 1990')
    })

    test('it returns null if date of birth on record is incomplete', () => {
      data.info.dateOfBirth = { day: null, month: '05', year: '1990' }

      const result = personalDobCheckPresenter(data, crn)

      expect(result.dateOfBirth).toBeNull()
    })
  })
})
