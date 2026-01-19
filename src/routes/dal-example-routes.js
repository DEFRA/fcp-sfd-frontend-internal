import { dalConnector } from '../dal/connector.js'
import { exampleQuery } from '../dal/queries/example-query.js'
import { config } from '../config/index.js'

// Temporary variables for the example query
const variables = {
  sbi: '113775119',
  crn: '1100186174'
}

// Mock data for when DAL_CONNECTION is false
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

const dalExample = {
  method: 'GET',
  path: '/dal-example',
  handler: async (request, h) => {
    // Check feature toggle - if DAL_CONNECTION is false, return mock data
    if (!config.get('featureToggle.dalConnection')) {
      return h.view('dal-example', { dalData: mockDalData })
    }

    // Otherwise, call DAL for real data
    const email = request.auth.credentials?.email
    const response = await dalConnector(exampleQuery, variables, email)

    return h.view('dal-example', { dalData: response.data })
  }
}

export const dalExampleRoutes = [
  dalExample
]
