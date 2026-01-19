export const exampleQuery = `
  query ExampleQuery($sbi: ID!, $crn: ID!) {
    business(sbi: $sbi) {
      sbi
      organisationId
      customer(crn: $crn) {
        crn
        firstName
        lastName
        role
      }
    }
  }
`
