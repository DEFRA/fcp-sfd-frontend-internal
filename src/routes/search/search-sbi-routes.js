import Joi from 'joi'
import { schemas, utils, constants } from '@defra/fcp-sfd-frontend-engine'

import { fetchSbiSearchDetailsService } from '../../services/search/fetch-sbi-search-details-service.js'
import { searchSbiPresenter } from '../../presenters/search/search-sbi-presenter.js'

const SEARCH_SBI_PATH = '/search-sbi'
const SEARCH_SBI_VIEW = 'search/search-sbi'

const getSearchSbi = {
  method: 'GET',
  path: SEARCH_SBI_PATH,
  options: {
    validate: {
      // Reuse the SBI schema so a repeated/invalid sbi query param is rejected rather than assumed to be a string
      query: Joi.object({ sbi: schemas.business.sbi.extract('sbi').trim() }),
      failAction: (request, h) => h.view(SEARCH_SBI_VIEW).code(constants.statusCodes.BAD_REQUEST).takeover()
    }
  },
  handler: async (request, h) => {
    // Requests sent to the /search page might be either to just show the search page or to view search results,
    // so we need to check whether this is just an initial request to display the page or whether it is a request for a
    // page of results. The SBI arrives via query string, either from the POST redirect or the "Search results" link.
    const sbi = request.query.sbi || ''

    if (!sbi) {
      return h.view(SEARCH_SBI_VIEW)
    }

    const email = request.auth.credentials?.email
    const sbiDetails = await fetchSbiSearchDetailsService(sbi, email)
    const pageData = searchSbiPresenter(sbiDetails, sbi)

    return h.view(SEARCH_SBI_VIEW, pageData)
  }
}

const postSearchSbi = {
  method: 'POST',
  path: SEARCH_SBI_PATH,
  handler: async (request, h) => {
    const { payload } = request
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

      return h.view(SEARCH_SBI_VIEW, pageData).code(constants.statusCodes.BAD_REQUEST).takeover()
    }

    const { sbi } = validation.value

    // Redirect with the SBI as a query param so the GET route can fetch and render results.
    return h.redirect(`${SEARCH_SBI_PATH}?sbi=${encodeURIComponent(sbi)}`)
  }
}

export const searchSbiRoutes = [
  getSearchSbi,
  postSearchSbi
]
