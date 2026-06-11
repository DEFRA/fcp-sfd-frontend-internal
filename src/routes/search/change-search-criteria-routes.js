import { utils } from '@defra/fcp-sfd-frontend-engine'

import { searchCriteriaSchema } from '../../schemas/search/search-criteria-schema.js'
import { BAD_REQUEST } from '../../constants/status-codes.js'

const CHANGE_SEARCH_CRITERIA_PATH = '/change-search-criteria'
const CHANGE_SEARCH_CRITERIA_VIEW = 'search/change-search-criteria'

const SEARCH_PATHS = {
  sbi: '/search-sbi',
  crn: '/search-crn'
}

const getChangeSearchCriteria = {
  method: 'GET',
  path: CHANGE_SEARCH_CRITERIA_PATH,
  handler: async (_request, h) => {
    return h.view(CHANGE_SEARCH_CRITERIA_VIEW)
  }
}

const postChangeSearchCriteria = {
  method: 'POST',
  path: CHANGE_SEARCH_CRITERIA_PATH,
  options: {
    validate: {
      payload: searchCriteriaSchema,
      options: { abortEarly: false },
      failAction: async (_request, h, err) => {
        const errors = utils.formatValidationErrors(err.details || [])

        return h.view(CHANGE_SEARCH_CRITERIA_VIEW, { errors }).code(BAD_REQUEST).takeover()
      }
    },
    handler: async (request, h) => {
      const { searchCriteria } = request.payload

      return h.redirect(SEARCH_PATHS[searchCriteria])
    }
  }
}

export const changeSearchCriteriaRoutes = [
  getChangeSearchCriteria,
  postChangeSearchCriteria
]
