import { BAD_REQUEST } from '../../constants/status-codes.js'

const CHANGE_SEARCH_CRITERIA_PATH = '/change-search-criteria'
const CHANGE_SEARCH_CRITERIA_SESSION_KEY = 'changeSearchCriteria'
const CHANGE_SEARCH_CRITERIA_VIEW = 'search/change-search-criteria'

const SEARCH_PATHS = {
  sbi: '/search-sbi',
  crn: '/search-crn'
}

const getChangeSearchCriteria = {
  method: 'GET',
  path: CHANGE_SEARCH_CRITERIA_PATH,
  handler: async (request, h) => {
    const searchState = request.yar.get(CHANGE_SEARCH_CRITERIA_SESSION_KEY)

    if (!searchState) {
      return h.view(CHANGE_SEARCH_CRITERIA_VIEW)
    }

    const { searchCriteria } = searchState

    request.yar.clear(CHANGE_SEARCH_CRITERIA_SESSION_KEY)

    return h.redirect(SEARCH_PATHS[searchCriteria])
  }
}

const postChangeSearchCriteria = {
  method: 'POST',
  path: CHANGE_SEARCH_CRITERIA_PATH,
  handler: async (request, h) => {
    const { searchCriteria } = request.payload

    if (!searchCriteria) {
      const errors = { searchCriteria: { text: 'Select what you want to search by' } }
      return h.view(CHANGE_SEARCH_CRITERIA_VIEW, { errors }).code(BAD_REQUEST).takeover()
    }

    request.yar.set(CHANGE_SEARCH_CRITERIA_SESSION_KEY, { searchCriteria })

    return h.redirect(CHANGE_SEARCH_CRITERIA_PATH)
  }
}

export const changeSearchCriteriaRoutes = [
  getChangeSearchCriteria,
  postChangeSearchCriteria
]
