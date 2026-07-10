/**
 * Test-only stub for personal details (dalData, mappedData). Same shape as
 * mapPersonalDetails from the DAL response; used by unit tests and mappers.
 *
 * @module mockPersonalDetails
 */

const getDalData = () => ({
  customer: {
    crn: '123456890',
    info: {
      dateOfBirth: '1990-01-01',
      name: {
        first: 'John',
        middle: 'M',
        last: 'Doe'
      },
      phone: {
        landline: '01234567890',
        mobile: null
      },
      email: {
        address: 'test@example.com'
      },
      address: {
        pafOrganisationName: 'Acme Corp',
        flatName: 'THE COACH HOUSE',
        buildingName: 'STOCKWELL HALL',
        buildingNumberRange: '7',
        street: 'HAREWOOD AVENUE',
        city: 'DARLINGTON',
        county: 'Dorset',
        dependentLocality: 'ELLICOMBE',
        doubleDependentLocality: 'WOODTHORPE',
        line1: '76 Robinswood Road',
        line2: 'UPPER CHUTE',
        line3: 'Child Okeford',
        line4: null,
        line5: null,
        postalCode: 'CO9 3LS',
        country: 'United Kingdom',
        uprn: '12345'
      }
    }
  }
})

const getMappedData = () => ({
  crn: '123456890',
  info: {
    userName: 'John Doe',
    fullName: {
      first: 'John',
      last: 'Doe',
      middle: 'M'
    },
    fullNameJoined: 'John M Doe',
    dateOfBirth: {
      full: '1990-01-01',
      day: '01',
      month: '01',
      year: '1990'
    }
  },
  address: {
    lookup: {
      pafOrganisationName: 'Acme Corp',
      flatName: 'THE COACH HOUSE',
      buildingName: 'STOCKWELL HALL',
      buildingNumberRange: '7',
      dependentLocality: 'ELLICOMBE',
      doubleDependentLocality: 'WOODTHORPE',
      street: 'HAREWOOD AVENUE',
      county: 'Dorset',
      uprn: '12345'
    },
    manual: {
      line1: '76 Robinswood Road',
      line2: 'UPPER CHUTE',
      line3: 'Child Okeford',
      line4: null,
      line5: null
    },
    city: 'DARLINGTON',
    postcode: 'CO9 3LS',
    country: 'United Kingdom'
  },
  contact: {
    email: 'test@example.com',
    telephone: '01234567890',
    mobile: null
  }
})

export {
  getDalData,
  getMappedData
}
