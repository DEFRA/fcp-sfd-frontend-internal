export const updateBusinessEmailMutation = `
  mutation Mutation($input: UpdateBusinessEmailInput!) {
    updateBusinessEmail(input: $input) {
      business {
        info {
          email {
            address
          }
        }
      }
      success
    }
  }
`
