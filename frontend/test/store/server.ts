import { createServer as createNodeServer } from 'http'
import type { IncomingMessage, ServerResponse } from 'http'
import type { AddressInfo } from 'net'
import { uniqueTestServerPort } from '../../src/store/internal/config/constants'

// onRequest is handed the request's body, parsed, when the request arrives
// and before it is answered: a test reads what was sent there, and one that
// plays another browser tab changes what the application has stored.
interface Response<T> {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE'
  pathname: string
  response: T
  status: number
  onRequest?: (body: unknown) => void
}

interface InternalResponse {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE'
  pathname: string
  response: Record<string, unknown> | undefined
  status: number
  onRequest: ((body: unknown) => void) | undefined
}

function parseBody(body: string): unknown {
  return body.length === 0 ? undefined : JSON.parse(body)
}

export interface TestServer {
  addResponse: <T>(response: Response<T>) => void
  clear: () => void
  close: () => void
}

export function createServer(): TestServer {
  // Responses are queued per path so that a test can set up several
  // responses to the same request in advance. They are served in the order
  // they were added.
  let requests: Record<string, InternalResponse[]> = {}

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
      response.onRequest?.(parseBody(body))
      res.writeHead(response.status, { 'Content-Type': 'application/json' })
      res.write(response.response ? JSON.stringify(response.response) : '')
      res.end()
      queued.shift()
      return
    }
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

  server.listen(uniqueTestServerPort, () => {
    const addressInfo: AddressInfo | string | null = server.address()
    // Null is returned when not listening yet which is impossible here.
    // String is returned when listening to pipe or Unix socket which is
    // equally impossible.
    /* v8 ignore next */
    if (typeof addressInfo === 'string' || addressInfo === null) {
      /* v8 ignore next -- See above why this is unreachable. */
      throw new Error('server address() did not return an AddressInfo instance')
    }
    const port = addressInfo.port
    console.log('TestServer listening on port', port)
  })

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

  return {
    addResponse: addTestServerResponse,
    clear: (): void => {
      requests = {}
    },
    close: (): void => {
      server.close()
    },
  }
}
