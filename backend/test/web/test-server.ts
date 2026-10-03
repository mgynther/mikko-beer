import { createClient } from '../client.js'
import type { Client } from '../client.js'
import { createWebServer } from '../../src/web/web-server.js'
import type { WebErrors, WebServer } from '../../src/web/web-server.js'
import type { ErrorResponse } from '../../src/web/error-response.js'
import { fakeApi } from './fake-api.js'
import type { ApiOverrides } from './fake-api.js'

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

export const unreadableBodyResponse: ErrorResponse = {
  status: 400,
  body: {
    error: { code: 'UnreadableBody', message: 'unreadable body' },
  },
}

class RepeatedQueryParameter extends Error {}

class UnreadableBody extends Error {}

export const testWebErrors: WebErrors = {
  handle: (error: unknown): ErrorResponse => {
    if (error instanceof RepeatedQueryParameter) {
      return repeatedQueryParameterResponse
    }
    if (error instanceof UnreadableBody) {
      return unreadableBodyResponse
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
  rejectUnreadableBody: (): never => {
    throw new UnreadableBody()
  },
}

export class TestServer {
  #server: WebServer | undefined
  #baseUrl: string = ''
  #request?: Client

  get request(): Client {
    return this.#request!
  }

  baseUrl = (): string => {
    return this.#baseUrl
  }

  start = async (
    api: ApiOverrides,
    errors: WebErrors = testWebErrors,
  ): Promise<void> => {
    this.#server = createWebServer(fakeApi(api), errors)
    const port = await this.#server.listen(0)
    this.#baseUrl = `http://localhost:${port}`
    this.#request = createClient(this.#baseUrl)
  }

  afterEach = async (): Promise<void> => {
    await this.#server?.close()
    this.#server = undefined
  }
}
