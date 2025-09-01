import { describe, test, expect, beforeAll, afterAll } from 'vitest'
import * as cheerio from 'cheerio'
import '../../../mocks/setup-server-mocks.js'

const { createServer } = await import('../../../../src/server.js')

describe('signed out route integration', async () => {
  let server
  let response

  beforeAll(async () => {
    server = await createServer()
    await server.initialize()
    response = await server.inject({
      method: 'GET',
      url: '/signed-out'
    })
  })

  afterAll(async () => {
    await server.stop()
  })

  test('signed out route is registered', async () => {
    expect(response.statusCode).toBe(200)
  })

  test('Ensure that page title is "You have signed out"', async () => {
    const $ = cheerio.load(response.result)
    const mainContent = $('#main-content')
    const pageTitle = mainContent.find('h1').text()

    expect(pageTitle).toEqual('You have signed out')
  })
})
