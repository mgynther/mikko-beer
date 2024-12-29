import { ajv } from '../ajv'

import {
  invalidStyleError,
  invalidStyleIdError
} from '../../errors'
import type { CreateStyleRequest, UpdateStyleRequest } from '../../style/style'

const doValidateStyleRequest =
  ajv.compile<CreateStyleRequest>({
    type: 'object',
    properties: {
      name: {
        type: 'string',
        minLength: 1
      },
      parents: {
        type: 'array',
        items: {
          type: 'string',
          minLength: 1
        }
      }
    },
    required: ['name', 'parents'],
    additionalProperties: false
  })

function isCreateStyleRequestValid (body: unknown): boolean {
  return doValidateStyleRequest(body)
}

function isUpdateStyleRequestValid (body: unknown): boolean {
  return doValidateStyleRequest(body)
}

export function validateCreateStyleRequest (body: unknown): CreateStyleRequest {
  if (!isCreateStyleRequestValid(body)) {
    throw invalidStyleError
  }

  /* eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion --
   * Validated using ajv.
   */
  const result = body as CreateStyleRequest
  return result
}

interface ValidUpdateStyleRequest {
  id: string
  request: UpdateStyleRequest
}

export function validateUpdateStyleRequest (
  body: unknown,
  styleId: string | undefined
): ValidUpdateStyleRequest {
  if (!isUpdateStyleRequestValid(body)) {
    throw invalidStyleError
  }
  /* eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion --
   * Validated using ajv.
   */
  const result = body as UpdateStyleRequest
  return {
    id: validateStyleId(styleId),
    request: result
  }
}

export function validateStyleId (id: string | undefined): string {
  if (id === undefined || id.length === 0) {
    throw invalidStyleIdError
  }
  return id
}
