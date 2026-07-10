export const personalDetailsQuery = `
query Customer($crn: ID!) {
  customer(crn: $crn) {
    crn
    info {
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
      dateOfBirth
      email {
        address
      }
      name {
        first
        last
        middle
      }
      phone {
        landline
        mobile
      }
    }
  }
}
`
