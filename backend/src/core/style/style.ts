import { ajv } from '../ajv'

export interface Style {
  id: string
  name: string | null
}

export interface StyleWithParents extends Style {
  parents: Style[]
}

export interface StyleWithParentIds extends Style {
  parents: string[]
}

export interface CreateStyleRequest {
  name?: string
  parents?: string[]
}

export interface UpdateStyleRequest {
  name?: string
  parents?: string[]
}

const doValidateStyleRequest =
  ajv.compile<CreateStyleRequest>({
    type: 'object',
    properties: {
      name: {
        type: 'string'
      },
      parents: {
        type: 'array',
        items: {
          type: 'string'
        }
      }
    },
    required: ['name'],
    additionalProperties: false
  })

export function validateCreateStyleRequest (body: unknown): boolean {
  return doValidateStyleRequest(body)
}

export function validateUpdateStyleRequest (body: unknown): boolean {
  return doValidateStyleRequest(body)
}
