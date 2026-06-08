export const customerDetailsByCrn = `
  query Customer($crn: ID!) {
  customer(crn: $crn) {
    crn
    info {
      name {
        first
        last
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
        uprn
      }
    }
  }
}
`
