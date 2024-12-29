import type { LockIds } from '../db'

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
