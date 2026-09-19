import * as t from 'io-ts'
import { isLeft } from 'fp-ts/Either'

import { formatError } from './format-error'

// The shapes this module hands out, declared here rather than imported from
// types/ because they are this layer's own view of what a valid response
// contains. types/ declares the same shapes for the components and the two
// meet in RtkApp, which is where drift between them turns into a compile
// error.
export interface Style {
  id: string
  name: string
}

export interface StyleWithParentIds extends Style {
  parents: string[]
}

export interface StyleWithParentsAndChildren extends Style {
  children: Style[]
  parents: Style[]
}

export interface StyleList {
  styles: StyleWithParentIds[]
}

export const ValidatedStyle = t.type({
  id: t.string,
  name: t.string,
})

const ValidatedStyleWithParentIds = t.type({
  id: t.string,
  name: t.string,
  parents: t.array(t.string),
})

const ValidatedStyleWithParentsAndChildren = t.type({
  id: t.string,
  name: t.string,
  children: t.array(ValidatedStyle),
  parents: t.array(ValidatedStyle),
})

const ValidatedStyleList = t.type({
  styles: t.array(ValidatedStyleWithParentIds),
})

// The decoded value is spelled out property by property rather than returned
// as it is. The decoder and the exported shape are two statements of the same
// thing and this is where they are made to agree: a property the backend
// starts sending is not passed on until someone adds it here.
export function toStyle(style: t.TypeOf<typeof ValidatedStyle>): Style {
  return {
    id: style.id,
    name: style.name,
  }
}

function toStyleWithParentIds(
  style: t.TypeOf<typeof ValidatedStyleWithParentIds>,
): StyleWithParentIds {
  return {
    id: style.id,
    name: style.name,
    parents: style.parents,
  }
}

function toStyleWithParentsAndChildren(
  style: t.TypeOf<typeof ValidatedStyleWithParentsAndChildren>,
): StyleWithParentsAndChildren {
  return {
    id: style.id,
    name: style.name,
    children: style.children.map(toStyle),
    parents: style.parents.map(toStyle),
  }
}

export function validateStyleOrUndefined(result: unknown): Style | undefined {
  if (typeof result === 'undefined') {
    return undefined
  }
  return validateStyle(result)
}

export function validateStyle(result: unknown): Style {
  const decoded = ValidatedStyle.decode(result)
  if (isLeft(decoded)) {
    throw Error(formatError(decoded))
  }
  return toStyle(decoded.right)
}

export function validateStyleWithParentsAndChildrenOrUndefined(
  result: unknown,
): StyleWithParentsAndChildren | undefined {
  if (typeof result === 'undefined') {
    return undefined
  }
  return validateStyleWithParentsAndChildren(result)
}

export function validateStyleWithParentsAndChildren(
  result: unknown,
): StyleWithParentsAndChildren {
  const decoded = ValidatedStyleWithParentsAndChildren.decode(result)
  if (isLeft(decoded)) {
    throw Error(formatError(decoded))
  }
  return toStyleWithParentsAndChildren(decoded.right)
}

export function validateStyleListOrUndefined(
  result: unknown,
): StyleList | undefined {
  if (typeof result === 'undefined') {
    return undefined
  }
  return validateStyleList(result)
}

export function validateStyleList(result: unknown): StyleList {
  const decoded = ValidatedStyleList.decode(result)
  if (isLeft(decoded)) {
    throw Error(formatError(decoded))
  }
  return {
    styles: decoded.right.styles.map(toStyleWithParentIds),
  }
}
