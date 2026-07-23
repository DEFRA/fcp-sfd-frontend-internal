/**
 * Builds the mutation variables for updating a user's business details
 * based only on the sections that actually need updating.
 *
 * @module buildBusinessUpdateVariablesService
 */

const buildBusinessUpdateVariablesService = (businessDetails) => {
  const { orderedSectionsToFix, info } = businessDetails
  const { sbi } = info

  const variables = {}

  if (orderedSectionsToFix.includes('email') && businessDetails.changeBusinessEmail) {
    variables.updateBusinessEmailInput = buildEmailInput(sbi, businessDetails)
  }

  return variables
}

const buildEmailInput = (sbi, businessDetails) => {
  return {
    sbi,
    email: {
      address: businessDetails.changeBusinessEmail.businessEmail
    }
  }
}

export {
  buildBusinessUpdateVariablesService
}
