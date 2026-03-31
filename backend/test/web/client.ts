type RequestBody = object
export type RequestHeaders = Record<string, string>
interface ClientResponse<T> {
  status: number
  data: T
}

export interface Client {
  get: <T = any>(url: string, headers?: RequestHeaders) =>
    Promise<ClientResponse<T>>
  post: <T = any>(url: string, body: RequestBody, headers?: RequestHeaders) =>
    Promise<ClientResponse<T>>
  put: <T = any>(url: string, body: RequestBody, headers?: RequestHeaders) =>
    Promise<ClientResponse<T>>
  delete: <T = any>(url: string, headers?: RequestHeaders) =>
    Promise<ClientResponse<T>>
}

export function createClient(baseUrl: string): Client {
  async function parseResponseBody<T>(response: Response): Promise<T> {
    const isJson = response.headers.get('content-type')
      ?.startsWith('application/json') ?? false
    const data:T = await (isJson ? response.json() : response.text())
    return data
  }
  async function createResponse<T>(
    response: Response
  ): Promise<ClientResponse<T>> {
    return {
      status: response.status,
      data: await parseResponseBody<T>(response)
    }
  }
  function combineHeaders(headers?: RequestHeaders): RequestHeaders {
    return {
      ...headers,
      'content-type': 'application/json'
    }
  }
  return {
    get: async <T = any>(url: string, headers?: RequestHeaders) => {
      const response = await fetch(`${baseUrl}${url}`, {
        method: 'GET',
        headers: combineHeaders(headers),
      })
      return createResponse<T>(response)
    },
    post: async <T = any>(
      url: string,
      body: RequestBody,
      headers?: RequestHeaders
    ) => {
      const response = await fetch(`${baseUrl}${url}`, {
        method: 'POST',
        headers: combineHeaders(headers),
        body: JSON.stringify(body)
      })
      return createResponse<T>(response)
    },
    put: async <T = any>(
      url: string,
      body: RequestBody,
      headers?: RequestHeaders
    ) => {
      const response = await fetch(`${baseUrl}${url}`, {
        method: 'PUT',
        headers: combineHeaders(headers),
        body: JSON.stringify(body)
      })
      return createResponse<T>(response)
    },
    delete: async <T = any>(url: string, headers?: RequestHeaders) => {
      const response = await fetch(`${baseUrl}${url}`, {
        method: 'DELETE',
        headers: combineHeaders(headers),
      })
      return createResponse<T>(response)
    },
  }
}
