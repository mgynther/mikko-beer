import * as t from 'io-ts'
import { isLeft } from 'fp-ts/Either'

import type {
  Style,
  StyleList,
  StyleWithParentsAndChildren
} from '../core/style/types'
import { formatError } from './format-error'

const ValidatedStyle = t.type({
  id: t.string,
  name: t.string
})

const ValidatedStyleWithParentIds = t.type({
  id: t.string,
  name: t.string,
  parents: t.array(t.string)
})

const ValidatedStyleWithParentsAndChildren = t.type({
  id: t.string,
  name: t.string,
  children: t.array(ValidatedStyle),
  parents: t.array(ValidatedStyle)
})

const ValidatedStyleList = t.type({
  styles: t.array(ValidatedStyleWithParentIds)
})

export function validateStyleOrUndefined(
  result: unknown
): Style | undefined {
  if (typeof result === 'undefined') {
    return undefined
  }
  return validateStyle(result)
}

export function validateStyle(result: unknown): Style {
  type StyleT = t.TypeOf<typeof ValidatedStyle>
  const decoded = ValidatedStyle.decode(result)
  if (isLeft(decoded)) {
    throw Error(formatError(decoded))
  }
  const valid: StyleT = decoded.right
  return valid
}

export function validateStyleWithParentsAndChildrenOrUndefined(
  result: unknown
): StyleWithParentsAndChildren | undefined {
  if (typeof result === 'undefined') {
    return undefined
  }
  return validateStyleWithParentsAndChildren(result)
}

export function validateStyleWithParentsAndChildren(
  result: unknown
): StyleWithParentsAndChildren {
  type StyleT = t.TypeOf<typeof ValidatedStyleWithParentsAndChildren>
  const decoded = ValidatedStyleWithParentsAndChildren.decode(result)
  if (isLeft(decoded)) {
    throw Error(formatError(decoded))
  }
  const valid: StyleT = decoded.right
  return valid
}

export function validateStyleListOrUndefined(
  result: unknown
): StyleList | undefined {
  if (typeof result === 'undefined') {
    return undefined
  }
  return validateStyleList(result)
}

export function validateStyleList(result: unknown): StyleList {
  type StyleListT = t.TypeOf<typeof ValidatedStyleList>
  const decoded = ValidatedStyleList.decode(result)
  if (isLeft(decoded)) {
    throw Error(formatError(decoded))
  }
  const valid: StyleListT = decoded.right
  return valid
}
