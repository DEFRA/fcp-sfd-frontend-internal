import { describe, test, expect, beforeAll, afterAll, vi } from 'vitest'
import http from 'node:http'
import https from 'node:https'
import net from 'node:net'
import tls from 'node:tls'

import { config } from '../../../src/config/index.js'
import { setupProxy } from '../../../src/utils/setup-proxy.js'

const targetHost = 'example.com'
const targetPort = 443

// A CONNECT proxy that accepts the tunnel request but never opens an upstream
// socket, so no network access is required.
const createStubProxy = () => {
  const proxy = http.createServer()
  const sockets = new Set()

  proxy.on('connect', (_request, clientSocket) => {
    sockets.add(clientSocket)
    clientSocket.on('close', () => sockets.delete(clientSocket))
    clientSocket.on('error', () => {})
    clientSocket.write('HTTP/1.1 200 Connection Established\r\n\r\n')
  })

  proxy.on('connection', (socket) => {
    sockets.add(socket)
    socket.on('close', () => sockets.delete(socket))
  })

  return {
    proxy,
    listen: () =>
      new Promise((resolve) => {
        proxy.listen(0, '127.0.0.1', () => resolve(`http://127.0.0.1:${proxy.address().port}`))
      }),
    close: () =>
      new Promise((resolve) => {
        for (const socket of sockets) {
          socket.destroy()
        }
        proxy.close(resolve)
      })
  }
}

describe('#setupProxy', () => {
  let stubProxy
  let proxyUrl
  let originalTlsConnect

  beforeAll(async () => {
    stubProxy = createStubProxy()
    proxyUrl = await stubProxy.listen()

    originalTlsConnect = tls.connect
    config.set('server.httpProxy', proxyUrl)

    setupProxy()
  })

  afterAll(async () => {
    tls.connect = originalTlsConnect
    config.set('server.httpProxy', null)
    await stubProxy.close()
  })

  // global-agent 4.x gated its TLS options on `configuration.secureEndpoint`, a
  // property Node core never sets. That left `servername` undefined, so Node
  // verified the certificate against "localhost" and every proxied HTTPS request
  // failed with "Hostname/IP does not match certificate's altnames".
  test('forwards the target hostname as the TLS servername when tunnelling through the proxy', async () => {
    const tlsOptions = await new Promise((resolve, reject) => {
      const connectSpy = vi.fn((options, ...args) => {
        resolve(options)

        // Prevent a real TLS handshake against the stub tunnel.
        options.socket?.destroy()

        return originalTlsConnect.call(tls, { ...options, socket: new net.Socket() }, ...args)
      })

      tls.connect = connectSpy

      https
        .get(`https://${targetHost}:${targetPort}/`, () => {})
        .on('error', () => {})

      setTimeout(() => reject(new Error('tls.connect was never called')), 5000)
    })

    expect(tlsOptions.servername).toBe(targetHost)
    expect(tlsOptions.rejectUnauthorized).not.toBe(false)
  })
})
