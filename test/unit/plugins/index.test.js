import { describe, test, expect } from 'vitest'
import headersPlugin from '../../../src/plugins/headers.js'
import errors from '../../../src/plugins/errors.js'
import { sso } from '../../../src/plugins/sso.js'
import { session } from '../../../src/plugins/session.js'
import { csp } from '../../../src/plugins/content-security-policy.js'
import { auth } from '../../../src/plugins/auth.js'
import { plugins } from '../../../src/plugins/index.js'
import { router } from '../../../src/plugins/router.js'

describe('registerPlugins', () => {
  test('should contain csp plugin', async () => {
    const cspIndex = plugins.findIndex(plugin => plugin.name === 'csp')
    expect(csp).toEqual(plugins[cspIndex])
  })

  test('should contain session plugin', async () => {
    const sessionIndex = plugins.findIndex(plugin => plugin.name === 'session')
    expect(session).toEqual(plugins[sessionIndex])
  })

  test('should contain auth plugin', async () => {
    const authIndex = plugins.findIndex(plugin => plugin.plugin.name === 'auth')
    expect(auth).toEqual(plugins[authIndex])
  })

  test('should contain sso plugin', async () => {
    const ssoIndex = plugins.findIndex(plugin => plugin.plugin.name === 'sso')
    expect(sso).toEqual(plugins[ssoIndex])
  })

  test('should contain router plugin', async () => {
    const routerIndex = plugins.findIndex(plugin => plugin.plugin.name === 'router')
    expect(router).toEqual(plugins[routerIndex])
  })

  test('should contain errors plugin', async () => {
    const errorsIndex = plugins.findIndex(plugin => plugin.name === 'errors')
    expect(errors).toEqual(plugins[errorsIndex])
  })

  test('should contain headers plugin', async () => {
    const headersIndex = plugins.findIndex(plugin => plugin.name === 'headers')
    expect(headersPlugin).toEqual(plugins[headersIndex])
  })
})
