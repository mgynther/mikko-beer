import { createServer as createNodeServer } from 'http'
import type { IncomingMessage, Server, ServerResponse } from 'http'
import type { AddressInfo } from 'net'
import { onTestFinished } from '../test'
import { assertDeepEqual } from '../assert'
import { listeningPort } from './internal/listening-port'

export interface ReceivedRequest {
  authorization: string | undefined
  body: unknown
}

// onRequest is handed what the request carried when it arrives and before it
// is answered: a test reads what was sent there, and one that plays another
// browser tab changes what the application has stored.
interface Response<T> {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE'
  pathname: string
  response: T
  status: number
  onRequest?: (request: ReceivedRequest) => void
}

interface InternalResponse {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE'
  pathname: string
  response: Record<string, unknown> | undefined
  status: number
  onRequest: ((request: ReceivedRequest) => void) | undefined
}

function parseBody(body: string): unknown {
  return body.length === 0 ? undefined : JSON.parse(body)
}

// unsettled lists what the test registered or caused and did not see
// through: a response nothing asked for and a request nothing expected.
export interface TestServer {
  url: string
  addResponse: <T>(response: Response<T>) => void
  unsettled: () => string[]
  clear: () => void
}

// Listens on a port the operating system picks, so that any number of
// servers, and of test runs, can be open at once.
function listen(server: Server): Promise<number> {
  return new Promise((resolve) => {
    server.listen(0, '127.0.0.1', () => {
      const addressInfo: AddressInfo | string | null = server.address()
      resolve(listeningPort(addressInfo))
    })
  })
}

// A server belongs to the test that created it. When the test finishes, the
// server closes and fails the test if anything is unsettled, so a request the
// test left running cannot reach the server of the test after it.
export async function createServer(): Promise<TestServer> {
  // Responses are queued per path so that a test can set up several
  // responses to the same request in advance. They are served in the order
  // they were added.
  let requests: Record<string, InternalResponse[]> = {}
  let unexpected: string[] = []

  const handler = (
    req: IncomingMessage,
    res: ServerResponse,
    body: string,
  ): void => {
    /* v8 ignore next -- with web request there is a string URL */
    if (typeof req.url !== 'string') {
      /* v8 ignore next -- with web request there is a string URL */
      throw new Error('url is not a string')
    }
    const url: string = req.url
    const queued = requests[url] ?? []
    const response = queued[0]
    const parsedURL = new URL(url, `http://${req.headers.host}`)
    // TODO access search params like this parsedURL.searchParams.get("keyword")
    if (
      response !== undefined &&
      req.method === response.method &&
      url === response.pathname
    ) {
      response.onRequest?.({
        authorization: req.headers.authorization,
        body: parseBody(body),
      })
      res.writeHead(response.status, { 'Content-Type': 'application/json' })
      res.write(response.response ? JSON.stringify(response.response) : '')
      res.end()
      queued.shift()
      return
    }
    unexpected.push(`unexpected request ${req.method} ${parsedURL.pathname}`)
    res.writeHead(500, { 'Content-Type': 'application/json' })
    res.write(
      JSON.stringify({
        errorMessage:
          `Unexpected request with method ${req.method} ` +
          `to path ${parsedURL.pathname}`,
      }),
    )
    res.end()
  }

  const server = createNodeServer((req, res) => {
    let body = ''
    req.on('data', (chunk: Buffer) => {
      body += chunk.toString()
    })
    req.on('end', () => {
      handler(req, res, body)
    })
  })

  const port: number = await listen(server)

  function addTestServerResponse<T>(response: Response<T>): void {
    const queued = requests[response.pathname] ?? []
    queued.push({
      method: response.method,
      pathname: response.pathname,
      response: response.response
        ? JSON.parse(JSON.stringify(response.response))
        : undefined,
      status: response.status,
      onRequest: response.onRequest,
    })
    requests[response.pathname] = queued
  }

  function unsettled(): string[] {
    const unused: string[] = Object.values(requests)
      .flat()
      .map(
        (response) => `unused response ${response.method} ${response.pathname}`,
      )
    return [...unexpected, ...unused]
  }

  onTestFinished(() => {
    server.close()
    assertDeepEqual(unsettled(), [])
  })

  return {
    url: `http://127.0.0.1:${port}`,
    addResponse: addTestServerResponse,
    unsettled,
    clear: (): void => {
      requests = {}
      unexpected = []
    },
  }
}
