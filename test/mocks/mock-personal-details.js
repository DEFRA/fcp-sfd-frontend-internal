const dalData = {
  customer: {
    crn: '123456890',
    info: {
      dateOfBirth: '1990-01-01',
      name: {
        title: 'Mr',
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
        flatName: 'THE COACH HOUSE',
        buildingName: 'STOCKWELL HALL',
        buildingNumberRange: '7',
        street: 'HAREWOOD AVENUE',
        city: 'DARLINGTON',
        county: 'Dorset',
        line1: '76 Robinswood Road',
        line2: 'UPPER CHUTE',
        line3: 'Child Okeford',
        line4: null,
        line5: null,
        postalCode: 'CO9 3LS',
        country: 'United Kingdom'
      }
    }
  }
}

const mappedData = {
  crn: '123456890',
  info: {
    dateOfBirth: '1990-01-01',
    fullName: {
      title: 'Mr',
      first: 'John',
      last: 'Doe',
      middle: 'M'
    }
  },
  address: {
    lookup: {
      flatName: 'THE COACH HOUSE',
      buildingName: 'STOCKWELL HALL',
      buildingNumberRange: '7',
      street: 'HAREWOOD AVENUE',
      city: 'DARLINGTON',
      county: 'Dorset'
    },
    manual: {
      line1: '76 Robinswood Road',
      line2: 'UPPER CHUTE',
      line3: 'Child Okeford',
      line4: null,
      line5: null
    },
    postcode: 'CO9 3LS',
    country: 'United Kingdom'
  },
  contact: {
    email: 'test@example.com',
    telephone: '01234567890',
    mobile: null
  }
}

export {
  dalData,
  mappedData
}
