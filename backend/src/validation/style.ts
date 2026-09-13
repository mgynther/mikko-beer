import { ajv } from './internal/ajv.js'

export interface CreateStyleRequest {
  name: string
  parents: string[]
}

export interface UpdateStyleRequest {
  name: string
  parents: string[]
}

export interface ValidUpdateStyleRequest {
  id: string
  request: UpdateStyleRequest
}

export type CreateStyleValidationResult =
  | {
      errorCode: 'invalid-style'
      result: undefined
    }
  | {
      errorCode: undefined
      result: CreateStyleRequest
    }

export type UpdateStyleValidationResult =
  | {
      errorCode: 'invalid-style' | 'invalid-style-id'
      result: undefined
    }
  | {
      errorCode: undefined
      result: ValidUpdateStyleRequest
    }

export type ValidateStyleIdResult =
  | {
      errorCode: 'invalid-style-id'
      result: undefined
    }
  | {
      errorCode: undefined
      result: string
    }

const doValidateStyleRequest = ajv.compile<CreateStyleRequest>({
  type: 'object',
  properties: {
    name: {
      type: 'string',
      minLength: 1,
    },
    parents: {
      type: 'array',
      items: {
        type: 'string',
        minLength: 1,
      },
    },
  },
  required: ['name', 'parents'],
  additionalProperties: false,
})

function isCreateStyleRequestValid(body: unknown): boolean {
  return doValidateStyleRequest(body)
}

function isUpdateStyleRequestValid(body: unknown): boolean {
  return doValidateStyleRequest(body)
}

export function validateCreateStyleRequest(
  body: unknown,
): CreateStyleValidationResult {
  if (!isCreateStyleRequestValid(body)) {
    return { errorCode: 'invalid-style', result: undefined }
  }

  /* eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion --
   * Validated using ajv.
   */
  const result = body as CreateStyleRequest
  return {
    errorCode: undefined,
    result,
  }
}

export function validateUpdateStyleRequest(
  body: unknown,
  styleId: string | undefined,
): UpdateStyleValidationResult {
  if (!isUpdateStyleRequestValid(body)) {
    return { errorCode: 'invalid-style', result: undefined }
  }
  const validationResult = validateStyleId(styleId)
  if (validationResult.errorCode === 'invalid-style-id') {
    return { errorCode: 'invalid-style-id', result: undefined }
  }
  /* eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion --
   * Validated using ajv.
   */
  const result = body as UpdateStyleRequest
  return {
    errorCode: undefined,
    result: {
      id: validationResult.result,
      request: result,
    },
  }
}

export function validateStyleId(id: string | undefined): ValidateStyleIdResult {
  if (id === undefined || id.length === 0) {
    return { errorCode: 'invalid-style-id', result: undefined }
  }
  return { errorCode: undefined, result: id }
}
