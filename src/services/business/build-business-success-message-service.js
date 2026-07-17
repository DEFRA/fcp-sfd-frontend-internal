/**
 * Builds a success notification message based on which business details
 * were updated by the user.
 *
 * Returns either plain text (for a single change) or HTML (for multiple changes)
 * suitable for rendering inside a GOV.UK notification banner.
 * @module buildBusinessSuccessMessageService
 */

const buildBusinessSuccessMessage = (businessDetails) => {
  const { orderedSectionsToFix } = businessDetails

  const changes = loopThroughSections(businessDetails, orderedSectionsToFix)

  if (changes.length === 1) {
    return {
      type: 'text',
      value: `You have updated your ${changes[0]}`
    }
  }

  return {
    type: 'html',
    value: `
      <h3 class="govuk-notification-banner__heading">
        You have updated your:
      </h3>
      <ul class="govuk-list govuk-list--bullet">
        ${changes.map(change => `<li>${change}</li>`).join('')}
      </ul>
    `
  }
}

const loopThroughSections = (businessDetails, orderedSectionsToFix) => {
  const changes = []

  for (const section of orderedSectionsToFix) {
    if (section === 'email' && businessDetails.changeBusinessEmail) {
      changes.push('business email address')
    }
  }

  return changes
}

export {
  buildBusinessSuccessMessage
}
