import { ajv } from '../ajv'

import {
  invalidStyleError,
  invalidStyleIdError
} from '../errors'

export interface Style {
  id: string
  name: string
}

export interface NewStyle {
  name: string
}

export interface StyleRelationship {
  parent: string
  child: string
}

export interface StyleWithParentsAndChildren extends Style {
  children: Style[]
  parents: Style[]
}

export interface StyleWithParentIds extends Style {
  parents: string[]
}

export interface CreateStyleRequest {
  name: string
  parents: string[]
}

export interface UpdateStyleRequest {
  name: string
  parents: string[]
}

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

export function validateUpdateStyleRequest (
  body: unknown,
  styleId: string | undefined
): UpdateStyleRequest {
  if (!isUpdateStyleRequestValid(body)) {
    throw invalidStyleError
  }
  if (styleId === undefined || styleId.length === 0) {
    throw invalidStyleIdError
  }

  /* eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion --
   * Validated using ajv.
   */
  const result = body as UpdateStyleRequest
  return result
}
