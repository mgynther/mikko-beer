import * as t from 'io-ts'
import { isLeft } from 'fp-ts/Either'

import type {
  Beer,
  BeerList,
  BeerWithIds
} from '../core/beer/types'
import { formatError } from './format-error'
import { ValidatedBrewery } from './brewery'
import { ValidatedStyle } from './style'

const ValidatedBeer = t.type({
  id: t.string,
  name: t.string,
  breweries: t.array(ValidatedBrewery),
  styles: t.array(ValidatedStyle)
})

const ValidatedBeerWithIds = t.type({
  id: t.string,
  name: t.string,
  breweries: t.array(t.string),
  styles: t.array(t.string)
})

const ValidatedBeerList = t.type({
  beers: t.array(ValidatedBeer)
})

export function validateBeerOrUndefined(
  result: unknown
): Beer | undefined {
  if (typeof result === 'undefined') {
    return undefined
  }
  return validateBeer(result)
}

function validateBeer(result: unknown): Beer {
  type BeerT = t.TypeOf<typeof ValidatedBeer>
  const decoded = ValidatedBeer.decode(result)
  if (isLeft(decoded)) {
    throw Error(formatError(decoded))
  }
  const valid: BeerT = decoded.right
  return valid
}

export function validateBeerWithIds(
  result: unknown
): BeerWithIds {
  type BeerT = t.TypeOf<typeof ValidatedBeerWithIds>
  const decoded = ValidatedBeerWithIds.decode(result)
  if (isLeft(decoded)) {
    throw Error(formatError(decoded))
  }
  const valid: BeerT = decoded.right
  return valid
}

export function validateBeerListOrUndefined(
  result: unknown
): BeerList | undefined {
  if (typeof result === 'undefined') {
    return undefined
  }
  return validateBeerList(result)
}

export function validateBeerList(result: unknown): BeerList {
  type BeerListT = t.TypeOf<typeof ValidatedBeerList>
  const decoded = ValidatedBeerList.decode(result)
  if (isLeft(decoded)) {
    throw Error(formatError(decoded))
  }
  const valid: BeerListT = decoded.right
  return valid
}
