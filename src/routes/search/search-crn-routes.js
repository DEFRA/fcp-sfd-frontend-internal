import { schemas, utils } from '@defra/fcp-sfd-frontend-engine'

import { fetchCrnSearchDetailsService } from '../../services/search/fetch-crn-search-details-service.js'
import { BAD_REQUEST } from '../../constants/status-codes.js'
import { searchCrnPresenter } from '../../presenters/search/search-crn-presenter.js'

const SEARCH_CRN_PATH = '/search-crn'
const SEARCH_CRN_SESSION_KEY = 'searchCrn'
const SEARCH_CRN_VIEW = 'search/search-crn'

const getSearchCrn = {
  method: 'GET',
  path: SEARCH_CRN_PATH,
  handler: async (request, h) => {
    const searchState = request.yar.get(SEARCH_CRN_SESSION_KEY)

    // Requests sent to the /search page might be either to just show the search page or to view search results,
    // so we need to check whether this is just an initial request to display the page or whether it is a request for a
    // page of results
    if (!searchState) {
      return h.view(SEARCH_CRN_VIEW)
    }

    const email = request.auth.credentials?.email
    const crnDetails = await fetchCrnSearchDetailsService(searchState.crn, email)
    const pageData = searchCrnPresenter(crnDetails, searchState.crn)

    request.yar.clear(SEARCH_CRN_SESSION_KEY)

    return h.view(SEARCH_CRN_VIEW, pageData)
  }
}

const postSearchCrn = {
  method: 'POST',
  path: SEARCH_CRN_PATH,
  handler: async (request, h) => {
    const { payload, yar } = request
    // Trim whitespace so values like " 1234567890 " are treated as valid CRN input.
    const crnInput = payload.crn?.trim() ?? ''

    // If the user submitted an empty form, just redirect back to the search page without showing a validation error.
    if (crnInput === '') {
      return h.redirect(SEARCH_CRN_PATH)
    }

    const validation = schemas.customer.crn.validate({ crn: crnInput })

    if (validation.error) {
      const errors = utils.formatValidationErrors(validation.error.details || [])
      const pageData = { ...payload, errors, showClear: true }

      return h.view(SEARCH_CRN_VIEW, pageData).code(BAD_REQUEST).takeover()
    }

    const { crn } = validation.value

    yar.set(SEARCH_CRN_SESSION_KEY, { crn })

    // Save CRN in session and redirect so the GET route can fetch and render results.
    return h.redirect(SEARCH_CRN_PATH)
  }
}

export const searchCrnRoutes = [
  getSearchCrn,
  postSearchCrn
]
