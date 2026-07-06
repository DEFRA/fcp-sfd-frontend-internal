import { schemas, utils } from '@defra/fcp-sfd-frontend-engine'

import { fetchSbiSearchDetailsService } from '../../services/search/fetch-sbi-search-details-service.js'
import { BAD_REQUEST } from '../../constants/status-codes.js'
import { searchSbiPresenter } from '../../presenters/search/search-sbi-presenter.js'

const SEARCH_SBI_PATH = '/search-sbi'
const SEARCH_SBI_SESSION_KEY = 'searchSbi'
const SEARCH_SBI_VIEW = 'search/search-sbi'

const getSearchSbi = {
  method: 'GET',
  path: SEARCH_SBI_PATH,
  handler: async (request, h) => {
    const sessionState = request.yar.get(SEARCH_SBI_SESSION_KEY)

    // Requests sent to the /search page might be either to just show the search page or to view search results,
    // so we need to check whether this is just an initial request to display the page or whether it is a request for a
    // page of results. The SBI can arrive via session (after a POST) or via query string (e.g. "Search results" link).
    const sbiFromQuery = request.query?.sbi?.trim() ?? ''
    const { error, value } = sbiFromQuery
      ? schemas.business.sbi.validate({ sbi: sbiFromQuery })
      : { error: null, value: null }

    const searchState = sessionState ?? (value ? { sbi: value.sbi } : null)

    if (!searchState) {
      return h.view(SEARCH_SBI_VIEW)
    }

    const email = request.auth.credentials?.email
    const sbiDetails = await fetchSbiSearchDetailsService(searchState.sbi, email)
    const pageData = searchSbiPresenter(sbiDetails, searchState.sbi)

    request.yar.clear(SEARCH_SBI_SESSION_KEY)

    return h.view(SEARCH_SBI_VIEW, pageData)
  }
}

const postSearchSbi = {
  method: 'POST',
  path: SEARCH_SBI_PATH,
  handler: async (request, h) => {
    const { payload, yar } = request
    // Trim whitespace so values like " 106705779 " are treated as valid SBI input.
    const sbiInput = payload.sbi?.trim() ?? ''

    // If the user submitted an empty form, just redirect back to the search page without showing a validation error.
    if (sbiInput === '') {
      return h.redirect(SEARCH_SBI_PATH)
    }

    const validation = schemas.business.sbi.validate({ sbi: sbiInput })

    if (validation.error) {
      const errors = utils.formatValidationErrors(validation.error.details || [])
      const pageData = { ...payload, errors, showClear: true, clearSearchLink: '/search-sbi' }

      return h.view(SEARCH_SBI_VIEW, pageData).code(BAD_REQUEST).takeover()
    }

    const { sbi } = validation.value

    yar.set(SEARCH_SBI_SESSION_KEY, { sbi })

    // Save SBI in session and redirect so the GET route can fetch and render results.
    return h.redirect(SEARCH_SBI_PATH)
  }
}

export const searchSbiRoutes = [
  getSearchSbi,
  postSearchSbi
]
