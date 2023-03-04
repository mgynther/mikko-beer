import { ajv } from '../util/ajv'

export interface Container {
  id: string
  type: string | null
  size: string | null
}

export interface CreateContainerRequest {
  type?: string
  size?: string
}

export interface UpdateContainerRequest {
  type?: string
  size?: string
}

const doValidateContainerRequest =
  ajv.compile<CreateContainerRequest>({
    type: 'object',
    properties: {
      type: {
        type: 'string'
      },
      size: {
        type: 'string',
        pattern: '^[1-9]{0,1}[0-9].[0-9]{2}$'
      }
    },
    required: ['type', 'size'],
    additionalProperties: false
  })

export function validateCreateContainerRequest (body: unknown): boolean {
  return doValidateContainerRequest(body) as boolean
}

export function validateUpdateContainerRequest (body: unknown): boolean {
  return doValidateContainerRequest(body) as boolean
}
