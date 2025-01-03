import { ajv } from '../ajv'

import {
  invalidContainerError,
  invalidContainerIdError
} from '../../errors'
import type {
  CreateContainerRequest,
  UpdateContainerRequest
} from '../../container/container'

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

  /* eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion --
   * Validated using ajv.
   */
  const result = body as CreateContainerRequest
  return result
}

interface ValidUpdateContainerRequest {
  id: string,
  request: UpdateContainerRequest
}

export function validateUpdateContainerRequest (
  body: unknown,
  containerId: string | undefined
): ValidUpdateContainerRequest {
  if (!isUpdateContainerRequestValid(body)) {
    throw invalidContainerError
  }
  /* eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion --
   * Validated using ajv.
   */
  const result = body as UpdateContainerRequest
  return {
    id: validateContainerId(containerId),
    request: result
  }
}

export function validateContainerId (id: string | undefined): string {
  if (id === undefined || id.length === 0) {
    throw invalidContainerIdError
  }
  return id
}
