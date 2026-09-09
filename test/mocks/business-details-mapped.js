const businessDetailsMapped = () => ({
  info: {
    sbi: '107183280',
    businessName: 'Herberts Lawn Mowing',
    vat: '123456789',
    traderNumber: '010203040506070880980',
    vendorNumber: '694523',
    legalStatus: 'Sole Proprietorship',
    legalStatusCode: 102111,
    registrationNumbers: {
      companiesHouse: null,
      charityCommission: null
    },
    type: 'Not Specified',
    countyParishHoldingNumbers: [{ cphNumber: '12/123/1234' }]
  },
  address: {
    lookup: {
      flatName: 'THE COACH HOUSE',
      buildingName: 'STOCKWELL HALL',
      buildingNumberRange: '7',
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
    landline: '01234567890',
    mobile: '07123456789'
  }
})

export {
  businessDetailsMapped
}
