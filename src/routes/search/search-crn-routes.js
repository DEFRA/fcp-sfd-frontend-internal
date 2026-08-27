import { schemas, utils, constants } from '@defra/fcp-sfd-frontend-engine'

import { SEARCH_CRN, SEARCH_CRN_VIEW } from '../../constants/search-links.js'
import { fetchCrnSearchDetailsService } from '../../services/search/fetch-crn-search-details-service.js'
import { searchCrnPresenter } from '../../presenters/search/search-crn-presenter.js'

const getSearchCrn = {
  method: 'GET',
  path: SEARCH_CRN,
  options: {
    validate: {
      // Reuse the CRN schema so a repeated/invalid crn query param is rejected rather than assumed to be a string
      query: schemas.customer.crn,
      failAction: (request, h) => h.view(SEARCH_CRN_VIEW).code(constants.statusCodes.BAD_REQUEST).takeover()
    }
  },
  handler: async (request, h) => {
    // The CRN arrives via query string, either from the POST redirect or the "Search results" link.
    // Route validation has already trimmed it, so it'll be a valid CRN, undefined, or ''.
    const { crn } = request.query

    // Undefined or '' is a falsy value, so this will catch both cases and just render the search page without results.
    if (!crn) {
      return h.view(SEARCH_CRN_VIEW)
    }

    const email = request.auth.credentials?.email
    const crnDetails = await fetchCrnSearchDetailsService(crn, email)
    const pageData = searchCrnPresenter(crnDetails, crn)

    return h.view(SEARCH_CRN_VIEW, pageData)
  }
}

const postSearchCrn = {
  method: 'POST',
  path: SEARCH_CRN,
  options: {
    validate: {
      payload: schemas.customer.crn,
      failAction: (request, h, err) => {
        const errors = utils.formatValidationErrors(err.details || [])
        const pageData = { ...request.payload, errors, showClear: true, clearSearchLink: SEARCH_CRN }

        return h.view(SEARCH_CRN_VIEW, pageData).code(constants.statusCodes.BAD_REQUEST).takeover()
      }
    }
  },
  handler: async (request, h) => {
    const { crn } = request.payload

    // An empty form submission just redirects back to the search page without showing a validation error.
    if (!crn) {
      return h.redirect(SEARCH_CRN)
    }

    // Redirect with the CRN as a query param so the GET route can fetch and render results.
    return h.redirect(`${SEARCH_CRN}?crn=${encodeURIComponent(crn)}`)
  }
}

export const searchCrnRoutes = [
  getSearchCrn,
  postSearchCrn
]
