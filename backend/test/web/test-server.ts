import { createClient } from '../client.js'
import type { Client } from '../client.js'
import { createWebServer } from '../../src/web/web-server.js'
import type { WebErrors, WebServer } from '../../src/web/web-server.js'
import type { ErrorResponse } from '../../src/web/error-response.js'
import { fakeApi } from './fake-api.js'
import type { ApiOverrides } from './fake-api.js'

const port = 3003

// What the error callbacks of a test server answer: the message of what was
// thrown, so that a test reaching an unexpected path fails readably.
export const repeatedQueryParameterResponse: ErrorResponse = {
  status: 400,
  body: {
    error: {
      code: 'RepeatedQueryParameter',
      message: 'repeated query parameter',
    },
  },
}

class RepeatedQueryParameter extends Error {}

export const testWebErrors: WebErrors = {
  handle: (error: unknown): ErrorResponse => {
    if (error instanceof RepeatedQueryParameter) {
      return repeatedQueryParameterResponse
    }
    return {
      status: 500,
      body: {
        error: {
          code: 'TestError',
          message: error instanceof Error ? error.message : `${error}`,
        },
      },
    }
  },
  rejectRepeatedQueryParameter: (): never => {
    throw new RepeatedQueryParameter()
  },
}

export class TestServer {
  #server: WebServer | undefined

  readonly request: Client = createClient(`http://localhost:${port}`)

  start = async (
    api: ApiOverrides,
    errors: WebErrors = testWebErrors,
  ): Promise<void> => {
    this.#server = createWebServer(fakeApi(api), errors)
    await this.#server.listen(port)
  }

  afterEach = async (): Promise<void> => {
    await this.#server?.close()
    this.#server = undefined
  }
}
