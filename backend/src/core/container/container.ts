import { ajv } from '../ajv'

import {
  invalidContainerError,
  invalidContainerIdError
} from '../errors'

export interface Container {
  id: string
  type: string
  size: string
}

export interface NewContainer {
  type: string
  size: string
}

export interface CreateContainerRequest {
  type: string
  size: string
}

export interface UpdateContainerRequest {
  type: string
  size: string
}

const doValidateContainerRequest =
  ajv.compile<CreateContainerRequest>({
    type: 'object',
    properties: {
      type: {
        type: 'string',
        minLength: 1
      },
      size: {
        type: 'string',
        pattern: '^[1-9]{0,1}[0-9].[0-9]{2}$'
      }
    },
    required: ['type', 'size'],
    additionalProperties: false
  })

function isCreateContainerRequestValid (body: unknown): boolean {
  return doValidateContainerRequest(body)
}

function isUpdateContainerRequestValid (body: unknown): boolean {
  return doValidateContainerRequest(body)
}

export function validateCreateContainerRequest (
  body: unknown
): CreateContainerRequest {
  if (!isCreateContainerRequestValid(body)) {
    throw invalidContainerError
  }

  const result = body as CreateContainerRequest
  return result
}

export function validateUpdateContainerRequest (
  body: unknown,
  containerId: string | undefined
): UpdateContainerRequest {
  if (!isUpdateContainerRequestValid(body)) {
    throw invalidContainerError
  }
  if (containerId === undefined ||
      containerId.length === 0
  ) {
    throw invalidContainerIdError
  }

  const result = body as UpdateContainerRequest
  return result
}
