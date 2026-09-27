// Tests read response bodies as whatever the endpoint is known to return
// without declaring it at each call, so a body is untyped unless a test asks.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ResponseData = any

type RequestBody = object
export type RequestHeaders = Record<string, string>
interface ClientResponse<T> {
  status: number
  data: T
}

export interface Client {
  get: <T = ResponseData>(
    url: string,
    headers?: RequestHeaders,
  ) => Promise<ClientResponse<T>>
  post: <T = ResponseData>(
    url: string,
    body: RequestBody,
    headers?: RequestHeaders,
  ) => Promise<ClientResponse<T>>
  put: <T = ResponseData>(
    url: string,
    body: RequestBody,
    headers?: RequestHeaders,
  ) => Promise<ClientResponse<T>>
  delete: <T = ResponseData>(
    url: string,
    headers?: RequestHeaders,
  ) => Promise<ClientResponse<T>>
}

export function createClient(baseUrl: string): Client {
  async function parseResponseBody<T>(response: Response): Promise<T> {
    const isJson =
      response.headers.get('content-type')?.startsWith('application/json') ??
      false
    const data: T = await (isJson ? response.json() : response.text())
    return data
  }
  async function createResponse<T>(
    response: Response,
  ): Promise<ClientResponse<T>> {
    return {
      status: response.status,
      data: await parseResponseBody<T>(response),
    }
  }
  function combineHeaders(headers?: RequestHeaders): RequestHeaders {
    return {
      ...headers,
      'content-type': 'application/json',
    }
  }
  return {
    get: async <T>(
      url: string,
      headers?: RequestHeaders,
    ): Promise<ClientResponse<T>> => {
      const response = await fetch(`${baseUrl}${url}`, {
        method: 'GET',
        headers: combineHeaders(headers),
      })
      return createResponse<T>(response)
    },
    post: async <T = ResponseData>(
      url: string,
      body: RequestBody,
      headers?: RequestHeaders,
    ): Promise<ClientResponse<T>> => {
      const response = await fetch(`${baseUrl}${url}`, {
        method: 'POST',
        headers: combineHeaders(headers),
        body: JSON.stringify(body),
      })
      return createResponse<T>(response)
    },
    put: async <T = ResponseData>(
      url: string,
      body: RequestBody,
      headers?: RequestHeaders,
    ): Promise<ClientResponse<T>> => {
      const response = await fetch(`${baseUrl}${url}`, {
        method: 'PUT',
        headers: combineHeaders(headers),
        body: JSON.stringify(body),
      })
      return createResponse<T>(response)
    },
    delete: async <T>(
      url: string,
      headers?: RequestHeaders,
    ): Promise<ClientResponse<T>> => {
      const response = await fetch(`${baseUrl}${url}`, {
        method: 'DELETE',
        headers: combineHeaders(headers),
      })
      return createResponse<T>(response)
    },
  }
}
