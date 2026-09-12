import { ajv } from './internal/ajv.js'

interface ContainerRequest {
  type: string
  size: string
}

export type CreateContainerRequest = ContainerRequest
export type UpdateContainerRequest = ContainerRequest

export interface ValidUpdateContainerRequest {
  id: string
  request: UpdateContainerRequest
}

export type CreateContainerValidationResult =
  | {
      errorCode: 'invalid-container'
      result: undefined
    }
  | {
      errorCode: undefined
      result: CreateContainerRequest
    }

export type UpdateContainerValidationResult =
  | {
      errorCode: 'invalid-container' | 'invalid-container-id'
      result: undefined
    }
  | {
      errorCode: undefined
      result: ValidUpdateContainerRequest
    }

export type ValidateContainerIdResult =
  | {
      errorCode: 'invalid-container-id'
      result: undefined
    }
  | {
      errorCode: undefined
      result: string
    }

const doValidateContainerRequest = ajv.compile<CreateContainerRequest>({
  type: 'object',
  properties: {
    type: {
      type: 'string',
      minLength: 1,
    },
    size: {
      type: 'string',
      pattern: '^[1-9]{0,1}[0-9].[0-9]{2}$',
    },
  },
  required: ['type', 'size'],
  additionalProperties: false,
})

function isCreateContainerRequestValid(body: unknown): boolean {
  return doValidateContainerRequest(body)
}

function isUpdateContainerRequestValid(body: unknown): boolean {
  return doValidateContainerRequest(body)
}

export function validateCreateContainerRequest(
  body: unknown,
): CreateContainerValidationResult {
  if (!isCreateContainerRequestValid(body)) {
    return { errorCode: 'invalid-container', result: undefined }
  }

  /* eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion --
   * Validated using ajv.
   */
  const result = body as CreateContainerRequest
  return {
    errorCode: undefined,
    result,
  }
}

export function validateUpdateContainerRequest(
  body: unknown,
  containerId: string | undefined,
): UpdateContainerValidationResult {
  if (!isUpdateContainerRequestValid(body)) {
    return { errorCode: 'invalid-container', result: undefined }
  }
  const validationResult = validateContainerId(containerId)
  if (validationResult.errorCode === 'invalid-container-id') {
    return { errorCode: 'invalid-container-id', result: undefined }
  }
  /* eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion --
   * Validated using ajv.
   */
  const result = body as UpdateContainerRequest
  return {
    errorCode: undefined,
    result: {
      id: validationResult.result,
      request: result,
    },
  }
}

export function validateContainerId(
  id: string | undefined,
): ValidateContainerIdResult {
  if (id === undefined || id.length === 0) {
    return { errorCode: 'invalid-container-id', result: undefined }
  }
  return { errorCode: undefined, result: id }
}
