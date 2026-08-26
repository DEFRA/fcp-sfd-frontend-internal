/**
 * Formats data ready for presenting in the `/customer/{crn}/details/fix` page
 * @module personalFixPresenter
 */

import { constants } from '@defra/fcp-sfd-frontend-engine'

const { PERSONAL_SECTION_ORDER, PERSONAL_UPDATE_TEXT_LABELS, PERSONAL_SECTION_LABELS } = constants.interrupterJourney

const personalFixPresenter = (personalDetails, crn) => {
  const { source, orderedSectionsToFix } = personalDetails
  const hasMultipleErrors = orderedSectionsToFix.length > 2

  return {
    backLink: crn ? `/customer/${crn}/details` : '/search-crn',
    pageTitle: 'Update your personal details',
    metaDescription: 'Update your personal details.',
    updateText: buildUpdateText(orderedSectionsToFix, source),
    listOfErrors: hasMultipleErrors ? buildListOfErrors(orderedSectionsToFix, source) : []
  }
}

/**
 * Builds the list of additional personal detail sections the user must fix.
 *
 * The list:
 * - follows the display order used on the personal details page
 * - excludes the section the user selected to start the fix journey (source)
 *
 * Used to populate the bullet list on the personal fix page.
 */
const buildListOfErrors = (orderedSectionsToFix, source) => {
  const result = []

  for (const field of PERSONAL_SECTION_ORDER) {
    if (orderedSectionsToFix.includes(field) && field !== source) {
      result.push(PERSONAL_SECTION_LABELS[field])
    }
  }

  return result
}

/**
 * Builds the introductory text for the personal fix page.
 *
 * The text depends on:
 * - how many personal detail sections need fixing
 * - whether the user started the journey from a specific section (source)
 *
 * `source` is the section link the user clicked to begin the fix journey
 * (for example, clicking "Change personal address" sets source to `address`).
 *
 * Behaviour:
 * - If exactly two sections need fixing, both are named explicitly in the text.
 * - If more than two sections need fixing and a source is provided, the source
 *   section is named and the remaining fixes are implied.
 * - If no source is provided, a generic message is shown.
 *
 * Note: There should never be a case where only one section needs fixing,
 * as the user would be taken directly to the standard update journey.
 */
const buildUpdateText = (orderedSectionsToFix, source) => {
  if (orderedSectionsToFix.length === 2) {
    const [first, second] = orderedSectionsToFix

    return `We will ask you to update ${PERSONAL_UPDATE_TEXT_LABELS[second]} as well as ${PERSONAL_UPDATE_TEXT_LABELS[first]}.`
  }

  if (source) {
    return `We will ask you to update these details as well as ${PERSONAL_UPDATE_TEXT_LABELS[source]}:`
  }

  return 'We will ask you to update these details.'
}

export {
  personalFixPresenter
}
