export const businessDetailsBySbi = `
  query Business($sbi: ID!) {
  business(sbi: $sbi) {
    sbi
    info {
      name
      traderNumber
      vendorNumber
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
        uprn
      }
    }
  }
}
`
