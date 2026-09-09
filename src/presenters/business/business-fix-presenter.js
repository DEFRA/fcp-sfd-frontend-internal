/**
 * Formats data ready for presenting in the `/business/{sbi}/details/fix` page
 * @module businessFixPresenter
 */

import { constants } from '@defra/fcp-sfd-frontend-engine'
import { SEARCH_SBI } from '../../constants/search-links.js'

const { BUSINESS_SECTION_ORDER, BUSINESS_UPDATE_TEXT_LABELS, BUSINESS_SECTION_LABELS } = constants.interrupterJourney

const businessFixPresenter = (data, sbi) => {
  const { source, orderedSectionsToFix } = data
  const hasMultipleErrors = orderedSectionsToFix.length > 2

  return {
    backLink: sbi ? `/business/${sbi}/details` : SEARCH_SBI,
    pageTitle: 'Update your business details',
    metaDescription: 'Update your business details.',
    businessName: data.info?.businessName ?? null,
    sbi: sbi ?? null,
    updateText: buildUpdateText(orderedSectionsToFix, source),
    listOfErrors: hasMultipleErrors ? buildListOfErrors(orderedSectionsToFix, source) : []
  }
}

/**
 * Builds the list of additional business detail sections the user must fix.
 *
 * The list:
 * - follows the display order used on the business details page
 * - excludes the section the user selected to start the fix journey (source)
 *
 * Used to populate the bullet list on the business fix page.
 */
const buildListOfErrors = (orderedSectionsToFix, source) => {
  const result = []

  for (const field of BUSINESS_SECTION_ORDER) {
    if (orderedSectionsToFix.includes(field) && field !== source) {
      result.push(BUSINESS_SECTION_LABELS[field])
    }
  }

  return result
}

/**
 * Builds the introductory text for the business fix page.
 *
 * The text depends on:
 * - how many business detail sections need fixing
 * - whether the user started the journey from a specific section (source)
 *
 * `source` is the section link the user clicked to begin the fix journey
 * (for example, clicking "Change business address" sets source to `address`).
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

    return `We will ask you to update ${BUSINESS_UPDATE_TEXT_LABELS[second]} as well as ${BUSINESS_UPDATE_TEXT_LABELS[first]}.`
  }

  if (source) {
    return `We will ask you to update these details as well as ${BUSINESS_UPDATE_TEXT_LABELS[source]}:`
  }

  return 'We will ask you to update these details.'
}

export {
  businessFixPresenter
}
