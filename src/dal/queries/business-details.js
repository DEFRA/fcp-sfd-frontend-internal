export const businessDetailsQuery = `
  query Business($sbi: ID!, $crn: ID!) {
  business(sbi: $sbi) {
    organisationId
    sbi
    info {
      name
      vat
      traderNumber
      vendorNumber
      legalStatus {
        code
        type
      }
      type {
        code
        type
      }
      address {
        buildingNumberRange
        buildingName
        flatName
        street
        city
        county
        postalCode
        country
        dependentLocality
        doubleDependentLocality
        line1
        line2
        line3
        line4
        line5
      }
      email {
        address
      }
      phone {
        mobile
        landline
      }
    }
    countyParishHoldings {
      cphNumber
    }
  }
  customer(crn: $crn) {
    info {
      name {
        first
        last
        title
      }
    }
  }
}
`
