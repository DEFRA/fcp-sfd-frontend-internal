const dalData = {
  business: {
    organisationId: '5565448',
    sbi: '107183280',
    info: {
      name: 'HENLEY, RE',
      vat: 'GB123456789',
      traderNumber: '010203040506070880980',
      vendorNumber: '694523',
      legalStatus: { code: 102111, type: 'Sole Proprietorship' },
      type: { code: 101443, type: 'Not Specified' },
      countyParishHoldings: [{ cphNumber: '12/123/1234' }],
      address: {
        buildingNumberRange: '7',
        buildingName: 'STOCKWELL HALL',
        flatName: 'THE COACH HOUSE',
        street: 'HAREWOOD AVENUE',
        city: 'DARLINGTON',
        county: 'Dorset',
        postalCode: 'CO9 3LS',
        country: 'United Kingdom',
        dependentLocality: 'ELLICOMBE',
        doubleDependentLocality: 'WOODTHORPE',
        line1: '76 Robinswood Road',
        line2: 'UPPER CHUTE',
        line3: 'Child Okeford',
        line4: null,
        line5: null
      },
      email: { address: 'henleyrej@eryelnehk.com.test' },
      phone: { mobile: null, landline: '01234031859' }
    }
  },
  customer: {
    info: {
      name: {
        first: 'Ingrid Jerimire Klaufichious Limouhetta Mortimious Neuekind Orpheus Perimillian Quixillotrio Reviticlese',
        last: 'Cook',
        title: 'Mrs.'
      }
    }
  }
}

const mappedData = {
  info: {
    sbi: '107183280',
    businessName: 'HENLEY, RE',
    vat: 'GB123456789',
    traderNumber: '010203040506070880980',
    vendorNumber: '694523',
    legalStatus: 'Sole Proprietorship',
    type: 'Not Specified',
    countyParishHoldingNumbers: [{ cphNumber: '12/123/1234' }]
  },
  address: {
    lookup: {
      flatName: 'THE COACH HOUSE',
      buildingNumberRange: '7',
      buildingName: 'STOCKWELL HALL',
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
    email: 'henleyrej@eryelnehk.com.test',
    landline: '01234031859',
    mobile: null
  },
  customer: {
    fullName: 'Mrs. Ingrid Jerimire Klaufichious Limouhetta Mortimious Neuekind Orpheus Perimillian Quixillotrio Reviticlese Cook'
  }
}

export {
  dalData,
  mappedData
}
