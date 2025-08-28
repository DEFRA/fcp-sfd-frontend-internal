export const permissionsQuery = `
query Customer($crn: ID!, $sbi: ID!) {
  business(sbi: $sbi) {
    customer(crn: $crn) {
      permissionGroups {
        id
        level
      }
    }
    info {
      name
    }
  }
}
`
