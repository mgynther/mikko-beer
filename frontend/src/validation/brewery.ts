import * as t from 'io-ts'
import { isLeft } from 'fp-ts/Either'

import type { Brewery, BreweryList } from '../types/brewery/types'
import { formatError } from './format-error'

export const ValidatedBreweryBasics = t.type({
  id: t.string,
  name: t.string,
})

const ValidatedBrewery = t.type({
  id: t.string,
  name: t.string,
  country: t.union([t.string, t.undefined]),
})

const ValidatedBreweryList = t.type({
  breweries: t.array(ValidatedBrewery),
})

// A country missing from the response is an explicit undefined from here on,
// so that no layer can forget to pass it along.
function toBrewery(brewery: t.TypeOf<typeof ValidatedBrewery>): Brewery {
  return {
    id: brewery.id,
    name: brewery.name,
    country: brewery.country,
  }
}

export function validateBreweryOrUndefined(
  result: unknown,
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
  return toBrewery(valid)
}

export function validateBreweryListOrUndefined(
  result: unknown,
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
  return {
    breweries: valid.breweries.map(toBrewery),
  }
}
