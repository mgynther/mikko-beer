import * as t from 'io-ts'
import { isLeft } from 'fp-ts/Either'

import { formatError } from './format-error'

// This layer's own view of a valid brewery, declared here rather than
// imported from types/. See the comment in style.ts.
//
// Breweries referred to by other entities are not known by their country.
export interface BreweryBasics {
  id: string
  name: string
}

export interface Brewery extends BreweryBasics {
  country: string | undefined
}

export interface BreweryList {
  breweries: Brewery[]
}

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

export function toBreweryBasics(
  brewery: t.TypeOf<typeof ValidatedBreweryBasics>,
): BreweryBasics {
  return {
    id: brewery.id,
    name: brewery.name,
  }
}

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
  const decoded = ValidatedBrewery.decode(result)
  if (isLeft(decoded)) {
    throw Error(formatError(decoded))
  }
  return toBrewery(decoded.right)
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
  const decoded = ValidatedBreweryList.decode(result)
  if (isLeft(decoded)) {
    throw Error(formatError(decoded))
  }
  return {
    breweries: decoded.right.breweries.map(toBrewery),
  }
}
