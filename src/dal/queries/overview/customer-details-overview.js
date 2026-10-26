/**
 * GraphQL query for customer details overview
 *
 * @module customerDetailsOverview
 */

export const customerDetailsOverview = `
  query Customer($crn: ID!) {
  customer(crn: $crn) {
    crn
    info {
      name {
        first
        last
      }
    }
    businesses {
      name
      sbi
    }
  }
}
`
