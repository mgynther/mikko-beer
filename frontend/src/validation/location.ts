import * as t from 'io-ts'
import { isLeft } from 'fp-ts/Either'

import { formatError } from './format-error'

// This layer's own view of a valid location, declared here rather than
// imported from types/. See the comment in style.ts.
export interface Location {
  id: string
  name: string
}

export interface LocationList {
  locations: Location[]
}

export const ValidatedLocation = t.type({
  id: t.string,
  name: t.string,
})

const ValidatedLocationList = t.type({
  locations: t.array(ValidatedLocation),
})

export function toLocation(
  location: t.TypeOf<typeof ValidatedLocation>,
): Location {
  return {
    id: location.id,
    name: location.name,
  }
}

export function validateLocationOrUndefined(
  result: unknown,
): Location | undefined {
  if (typeof result === 'undefined') {
    return undefined
  }
  return validateLocation(result)
}

export function validateLocation(result: unknown): Location {
  const decoded = ValidatedLocation.decode(result)
  if (isLeft(decoded)) {
    throw Error(formatError(decoded))
  }
  return toLocation(decoded.right)
}

export function validateLocationListOrUndefined(
  result: unknown,
): LocationList | undefined {
  if (typeof result === 'undefined') {
    return undefined
  }
  return validateLocationList(result)
}

export function validateLocationList(result: unknown): LocationList {
  const decoded = ValidatedLocationList.decode(result)
  if (isLeft(decoded)) {
    throw Error(formatError(decoded))
  }
  return {
    locations: decoded.right.locations.map(toLocation),
  }
}
