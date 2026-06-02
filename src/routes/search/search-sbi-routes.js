import { schemas, utils } from '@defra/fcp-sfd-frontend-engine'

import { fetchSbiSearchDetailsService } from '../../services/search/fetch-sbi-search-details-service.js'
import { BAD_REQUEST } from '../../constants/status-codes.js'
import { searchSbiPresenter } from '../../presenters/search/search-sbi-presenter.js'

const SEARCH_SBI_PATH = '/search-sbi'
const SEARCH_SBI_SESSION_KEY = 'searchSbi'

const getSearchSbi = {
  method: 'GET',
  path: SEARCH_SBI_PATH,
  handler: async (request, h) => {
    const searchState = request.yar.get(SEARCH_SBI_SESSION_KEY)

    if (!searchState) {
      return h.view('search/search-sbi')
    }

    const email = request.auth.credentials?.email
    const sbiDetails = await fetchSbiSearchDetailsService(searchState.sbi, email)
    const pageData = searchSbiPresenter(sbiDetails, searchState.sbi)

    request.yar.clear(SEARCH_SBI_SESSION_KEY)

    return h.view('search/search-sbi', pageData)
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
      const pageData = { ...payload, errors }

      return h.view('search/search-sbi', pageData).code(BAD_REQUEST).takeover()
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
