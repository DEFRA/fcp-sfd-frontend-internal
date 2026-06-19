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
