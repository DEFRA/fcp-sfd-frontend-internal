import { utils, constants } from '@defra/fcp-sfd-frontend-engine'

import { searchCriteriaSchema } from '../../schemas/search/search-criteria-schema.js'
import { SEARCH_SBI, SEARCH_CRN, CHANGE_SEARCH_CRITERIA, CHANGE_SEARCH_CRITERIA_VIEW } from '../../constants/search-links.js'

const SEARCH_PATHS = {
  sbi: SEARCH_SBI,
  crn: SEARCH_CRN
}

const getChangeSearchCriteria = {
  method: 'GET',
  path: CHANGE_SEARCH_CRITERIA,
  handler: async (_request, h) => {
    return h.view(CHANGE_SEARCH_CRITERIA_VIEW)
  }
}

const postChangeSearchCriteria = {
  method: 'POST',
  path: CHANGE_SEARCH_CRITERIA,
  options: {
    validate: {
      payload: searchCriteriaSchema,
      options: { abortEarly: false },
      failAction: async (_request, h, err) => {
        const errors = utils.formatValidationErrors(err.details || [])

        return h.view(CHANGE_SEARCH_CRITERIA_VIEW, { errors }).code(constants.statusCodes.BAD_REQUEST).takeover()
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
