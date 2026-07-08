export const businessDetailsQuery = `
  query Business($sbi: ID!) {
  business(sbi: $sbi) {
    sbi
    info {
      name
      vat
      traderNumber
      vendorNumber
      legalStatus {
        type
      }
      type {
        type
      }
      address {
        pafOrganisationName
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
        uprn
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
}
`
