import * as t from 'io-ts'
import { isLeft } from 'fp-ts/Either'

import { formatError } from './format-error'
import type { BreweryBasics } from './brewery'
import { ValidatedBreweryBasics, toBreweryBasics } from './brewery'
import type { Style } from './style'
import { ValidatedStyle, toStyle } from './style'

// This layer's own view of a valid beer, declared here rather than imported
// from types/. See the comment in style.ts.
export interface Beer {
  id: string
  name: string
  breweries: BreweryBasics[]
  styles: Style[]
}

export interface BeerWithIds {
  id: string
  name: string
  breweries: string[]
  styles: string[]
}

export interface BeerList {
  beers: Beer[]
}

const ValidatedBeer = t.type({
  id: t.string,
  name: t.string,
  breweries: t.array(ValidatedBreweryBasics),
  styles: t.array(ValidatedStyle),
})

const ValidatedBeerWithIds = t.type({
  id: t.string,
  name: t.string,
  breweries: t.array(t.string),
  styles: t.array(t.string),
})

const ValidatedBeerList = t.type({
  beers: t.array(ValidatedBeer),
})

function toBeer(beer: t.TypeOf<typeof ValidatedBeer>): Beer {
  return {
    id: beer.id,
    name: beer.name,
    breweries: beer.breweries.map(toBreweryBasics),
    styles: beer.styles.map(toStyle),
  }
}

export function validateBeerOrUndefined(result: unknown): Beer | undefined {
  if (typeof result === 'undefined') {
    return undefined
  }
  return validateBeer(result)
}

function validateBeer(result: unknown): Beer {
  const decoded = ValidatedBeer.decode(result)
  if (isLeft(decoded)) {
    throw Error(formatError(decoded))
  }
  return toBeer(decoded.right)
}

export function validateBeerWithIds(result: unknown): BeerWithIds {
  const decoded = ValidatedBeerWithIds.decode(result)
  if (isLeft(decoded)) {
    throw Error(formatError(decoded))
  }
  const beer = decoded.right
  return {
    id: beer.id,
    name: beer.name,
    breweries: beer.breweries,
    styles: beer.styles,
  }
}

export function validateBeerListOrUndefined(
  result: unknown,
): BeerList | undefined {
  if (typeof result === 'undefined') {
    return undefined
  }
  return validateBeerList(result)
}

export function validateBeerList(result: unknown): BeerList {
  const decoded = ValidatedBeerList.decode(result)
  if (isLeft(decoded)) {
    throw Error(formatError(decoded))
  }
  return {
    beers: decoded.right.beers.map(toBeer),
  }
}
