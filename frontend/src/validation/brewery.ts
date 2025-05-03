import * as t from 'io-ts'
import { isLeft } from 'fp-ts/Either'

import type { Brewery, BreweryList } from '../core/brewery/types'
import { formatError } from './format-error'

const ValidatedBrewery = t.type({
  id: t.string,
  name: t.string
})

const ValidatedBreweryList = t.type({
  breweries: t.array(ValidatedBrewery)
})

export function validateBreweryOrUndefined(
  result: unknown
): Brewery | undefined {
  if (typeof result === 'undefined') {
    return undefined
  }
  return validateBrewery(result)
}

export function validateBrewery(result: unknown): Brewery {
  type BreweryT = t.TypeOf<typeof ValidatedBrewery>
  const decoded = ValidatedBrewery.decode(result)
  if (isLeft(decoded)) {
    throw Error(formatError(decoded))
  }
  const valid: BreweryT = decoded.right
  return valid
}

export function validateBreweryListOrUndefined(
  result: unknown
): BreweryList | undefined {
  if (typeof result === 'undefined') {
    return undefined
  }
  return validateBreweryList(result)
}

export function validateBreweryList(result: unknown): BreweryList {
  type BreweryListT = t.TypeOf<typeof ValidatedBreweryList>
  const decoded = ValidatedBreweryList.decode(result)
  if (isLeft(decoded)) {
    throw Error(formatError(decoded))
  }
  const valid: BreweryListT = decoded.right
  return valid
}
