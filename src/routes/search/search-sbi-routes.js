import { schemas, utils, constants } from '@defra/fcp-sfd-frontend-engine'

import { SEARCH_SBI, SEARCH_SBI_VIEW } from '../../constants/search-links.js'
import { fetchSbiSearchDetailsService } from '../../services/search/fetch-sbi-search-details-service.js'
import { searchSbiPresenter } from '../../presenters/search/search-sbi-presenter.js'

const getSearchSbi = {
  method: 'GET',
  path: SEARCH_SBI,
  options: {
    validate: {
      query: schemas.business.sbi,
      failAction: (request, h) => h.view(SEARCH_SBI_VIEW).code(constants.statusCodes.BAD_REQUEST).takeover()
    }
  },
  handler: async (request, h) => {
    // The SBI arrives via query string, either from the POST redirect or the "Search results" link.
    // Route validation has already trimmed it, so it'll be a valid SBI, undefined, or ''.
    const { sbi } = request.query

    // Undefined or '' is a falsy value, so this will catch both cases and just render the search page without results.
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
  path: SEARCH_SBI,
  options: {
    validate: {
      payload: schemas.business.sbi,
      failAction: (request, h, err) => {
        const errors = utils.formatValidationErrors(err.details || [])
        const pageData = { ...request.payload, errors, showClear: true, clearSearchLink: SEARCH_SBI }

        return h.view(SEARCH_SBI_VIEW, pageData).code(constants.statusCodes.BAD_REQUEST).takeover()
      }
    }
  },
  handler: async (request, h) => {
    const { sbi } = request.payload

    // An empty form submission just redirects back to the search page without showing a validation error.
    if (!sbi) {
      return h.redirect(SEARCH_SBI)
    }

    // Redirect with the SBI as a query param so the GET route can fetch and render results.
    return h.redirect(`${SEARCH_SBI}?sbi=${encodeURIComponent(sbi)}`)
  }
}

export const searchSbiRoutes = [
  getSearchSbi,
  postSearchSbi
]
