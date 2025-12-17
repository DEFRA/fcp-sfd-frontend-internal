import { dalConnector } from '../dal/connector.js'
import { exampleQuery } from '../dal/queries/example-query.js'

const variables = {
  sbi: '113775119',
  crn: '1100186174'
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
    const email = request.auth.credentials?.email
    const response = await dalConnector(exampleQuery, variables, email)

    return h.view('home', { dalData: response.data })
  }
}

export const homeRoutes = [
  index,
  home
]
