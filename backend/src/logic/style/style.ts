import type { LockIds } from '../db.js'

export interface CreateStyleIf {
  create: (style: NewStyle) => Promise<Style>
  lockStyles: LockIds
  insertParents: (styleId: string, parents: string[]) => Promise<void>
  listAllRelationships: () => Promise<StyleRelationship[]>
}

export interface UpdateStyleIf {
  update: (style: Style) => Promise<Style>
  lockStyles: LockIds
  insertParents: (styleId: string, parents: string[]) => Promise<void>
  listAllRelationships: () => Promise<StyleRelationship[]>
  deleteStyleChildRelationships: (styleId: string) => Promise<void>
}

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

export type ValidateCreateStyle = (body: unknown) => CreateStyleValidationResult

export type UpdateStyleValidationResult =
  | {
      errorCode: 'invalid-style' | 'invalid-style-id'
      result: undefined
    }
  | {
      errorCode: undefined
      result: ValidUpdateStyleRequest
    }

export type ValidateUpdateStyle = (
  body: unknown,
  id: string | undefined,
) => UpdateStyleValidationResult

export type ValidateStyleIdResult =
  | {
      errorCode: 'invalid-style-id'
      result: undefined
    }
  | {
      errorCode: undefined
      result: string
    }

export type ValidateStyleId = (id: string | undefined) => ValidateStyleIdResult
