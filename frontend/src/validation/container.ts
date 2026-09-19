import * as t from 'io-ts'
import { isLeft } from 'fp-ts/Either'

import { formatError } from './format-error'

// This layer's own view of a valid container, declared here rather than
// imported from types/. See the comment in style.ts.
export interface Container {
  id: string
  type: string
  size: string
}

export interface ContainerList {
  containers: Container[]
}

export const ValidatedContainer = t.type({
  id: t.string,
  type: t.string,
  size: t.string,
})

const ValidatedContainerList = t.type({
  containers: t.array(ValidatedContainer),
})

export function toContainer(
  container: t.TypeOf<typeof ValidatedContainer>,
): Container {
  return {
    id: container.id,
    type: container.type,
    size: container.size,
  }
}

export function validateContainer(result: unknown): Container {
  const decoded = ValidatedContainer.decode(result)
  if (isLeft(decoded)) {
    throw Error(formatError(decoded))
  }
  return toContainer(decoded.right)
}

export function validateContainerListOrUndefined(
  result: unknown,
): ContainerList | undefined {
  if (typeof result === 'undefined') {
    return undefined
  }
  return validateContainerList(result)
}

function validateContainerList(result: unknown): ContainerList {
  const decoded = ValidatedContainerList.decode(result)
  if (isLeft(decoded)) {
    throw Error(formatError(decoded))
  }
  return {
    containers: decoded.right.containers.map(toContainer),
  }
}
