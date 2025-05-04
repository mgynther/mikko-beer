import * as t from 'io-ts'
import { isLeft } from 'fp-ts/Either'

import type { Container, ContainerList } from '../core/container/types'
import { formatError } from './format-error'

const ValidatedContainer = t.type({
  id: t.string,
  type: t.string,
  size: t.string
})

const ValidatedContainerList = t.type({
  containers: t.array(ValidatedContainer)
})

export function validateContainer(result: unknown): Container {
  type ContainerT = t.TypeOf<typeof ValidatedContainer>
  const decoded = ValidatedContainer.decode(result)
  if (isLeft(decoded)) {
    throw Error(formatError(decoded))
  }
  const valid: ContainerT = decoded.right
  return valid
}

export function validateContainerListOrUndefined(
  result: unknown
): ContainerList | undefined {
  if (typeof result === 'undefined') {
    return undefined
  }
  return validateContainerList(result)
}

function validateContainerList(result: unknown): ContainerList {
  type ContainerListT = t.TypeOf<typeof ValidatedContainerList>
  const decoded = ValidatedContainerList.decode(result)
  if (isLeft(decoded)) {
    throw Error(formatError(decoded))
  }
  const valid: ContainerListT = decoded.right
  return valid
}
