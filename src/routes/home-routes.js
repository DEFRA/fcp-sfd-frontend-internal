import { dalConnector } from '../dal/connector.js'
import { exampleQuery } from '../dal/queries/example-query.js'
import { config } from '../config/index.js'

// Temporary variables for the example query
const variables = {
  sbi: '113775119',
  crn: '1100186174'
}

// Mock data for when DAL_CONNECTION is false (tests)
const mockDalData = {
  business: {
    sbi: '113775119',
    organisationId: '5565448',
    customer: {
      crn: '1100186174',
      firstName: 'John',
      lastName: 'Doe',
      role: 'test-role'
    }
  }
}

const index = {
  method: 'GET',
  path: '/',
  options: {
    auth: { mode: 'try' }
  },
  handler: (_request, h) => {
    return h.view('index')
  }
}

const home = {
  method: 'GET',
  path: '/home',
  handler: async (request, h) => {
    // Check feature toggle - if DAL_CONNECTION is false, return mock data
    if (!config.get('featureToggle.dalConnection')) {
      return h.view('home', { dalData: mockDalData })
    }

    // Otherwise, call DAL for real data
    const email = request.auth.credentials?.email
    const response = await dalConnector(exampleQuery, variables, email)

    return h.view('home', { dalData: response.data })
  }
}

export const homeRoutes = [
  index,
  home
]
