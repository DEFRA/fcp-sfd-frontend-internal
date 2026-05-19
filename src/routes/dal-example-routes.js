import { dalConnector } from '../dal/connector.js'
import { exampleQuery } from '../dal/queries/example-query.js'

const variables = {
  sbi: '113775119',
  crn: '1100186174'
}

const dalExample = {
  method: 'GET',
  path: '/dal-example',
  handler: async (request, h) => {
    const email = request.auth.credentials?.email
    const response = await dalConnector(exampleQuery, variables, email)

    return h.view('dal-example', { dalData: response.data })
  }
}

export const dalExampleRoutes = [
  dalExample
]
