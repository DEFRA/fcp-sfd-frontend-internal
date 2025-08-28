export const personalDetailsQuery = `
query Customer($crn: ID!) {
  customer(crn: $crn) {
    crn
    info {
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
      dateOfBirth
      email {
        address
      }
      name {
        first
        last
        middle
        title
      }
      phone {
        landline
        mobile
      }
    }
  }
}
`
