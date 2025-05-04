import * as t from 'io-ts'
import { isLeft } from 'fp-ts/Either'

import type { Location, LocationList } from '../core/location/types'
import { formatError } from './format-error'

const ValidatedLocation = t.type({
  id: t.string,
  name: t.string
})

const ValidatedLocationList = t.type({
  locations: t.array(ValidatedLocation)
})

export function validateLocationOrUndefined(
  result: unknown
): Location | undefined {
  if (typeof result === 'undefined') {
    return undefined
  }
  return validateLocation(result)
}

export function validateLocation(result: unknown): Location {
  type LocationT = t.TypeOf<typeof ValidatedLocation>
  const decoded = ValidatedLocation.decode(result)
  if (isLeft(decoded)) {
    throw Error(formatError(decoded))
  }
  const valid: LocationT = decoded.right
  return valid
}

export function validateLocationListOrUndefined(
  result: unknown
): LocationList | undefined {
  if (typeof result === 'undefined') {
    return undefined
  }
  return validateLocationList(result)
}

export function validateLocationList(result: unknown): LocationList {
  type LocationListT = t.TypeOf<typeof ValidatedLocationList>
  const decoded = ValidatedLocationList.decode(result)
  if (isLeft(decoded)) {
    throw Error(formatError(decoded))
  }
  const valid: LocationListT = decoded.right
  return valid
}
