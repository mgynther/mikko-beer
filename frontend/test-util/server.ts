import { createServer } from "http"
import type { IncomingMessage, ServerResponse } from "http"
import type { AddressInfo } from "net"
import { uniqueTestServerPort } from "../src/constants"

interface Response<T> {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE'
  pathname: string
  response: T
  status: number
}

interface InternalResponse {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE'
  pathname: string
  response: Record<string, unknown> | undefined
  status: number
}

const requests: Record<string, InternalResponse> = {}

const handler = async (req: IncomingMessage, res: ServerResponse) => {
  /* v8 ignore next -- with web request there is a string URL */
  if (typeof req.url !== 'string') {
    /* v8 ignore next -- with web request there is a string URL */
    throw new Error('url is not a string')
  }
  const url: string = req.url
  const response = requests[url]
  const parsedURL = new URL(url, `http://${req.headers.host}`)
  // TODO access search params like this parsedURL.searchParams.get("keyword")
  if (response !== undefined && req.method === response.method && url === response.pathname) {
    res.writeHead(response.status, { 'Content-Type': 'application/json' })
    res.write(response.response ? JSON.stringify(response.response) : '')
    res.end()
    delete requests[url]
    return
  }
  res.writeHead(500, { 'Content-Type': 'application/json' })
  res.write(JSON.stringify({ errorMessage: `Unexpected request with method ${req.method} to path ${parsedURL.pathname}` }))
  res.end()
}

const server = createServer(handler)

server.listen(uniqueTestServerPort, () => {
  const addressInfo: AddressInfo | string | null = server.address()
  // Null is returned when not listening yet which is impossible here. String is
  // returned when listening to pipe or Unix socket which is equally impossible.
  /* v8 ignore next */
  if (typeof addressInfo === 'string' || addressInfo === null) {
    /* v8 ignore next -- See above why this is unreachable. */
    throw new Error('server address() did not return an AddressInfo instance')
  }
  const port = addressInfo.port
  console.log('TestServer listening on port', port)
})

export function addTestServerResponse<T>(response: Response<T>): void {
  requests[response.pathname] = {
    method: response.method,
    pathname: response.pathname,
    response: response.response
      ? JSON.parse(JSON.stringify(response.response))
      : undefined,
    status: response.status
  }
}
