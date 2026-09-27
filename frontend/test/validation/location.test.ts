import { test } from '../test'
import { assertDeepEqual, assertThrows } from '../assert'

import type { Location, LocationList } from '../../src/validation/location'

import {
  validateLocation,
  validateLocationOrUndefined,
  validateLocationList,
  validateLocationListOrUndefined,
} from '../../src/validation/location'

const validLocation: Location = {
  id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  name: 'Kuja Beer Shop & Bar',
}

test('validateLocation returns location for valid input', () => {
  assertDeepEqual(validateLocation(validLocation), validLocation)
})

test('validateLocation throws for invalid input', () => {
  assertThrows(() =>
    validateLocation({
      id: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
    }),
  )
})

test('validateLocationOrUndefined returns undefined for undefined', () => {
  assertDeepEqual(validateLocationOrUndefined(undefined), undefined)
})

test('validateLocationOrUndefined returns location for valid input', () => {
  assertDeepEqual(validateLocationOrUndefined(validLocation), validLocation)
})

test('validateLocationOrUndefined throws for invalid input', () => {
  assertThrows(() => validateLocationOrUndefined({ name: 'id missing' }))
})

test('validateLocationList returns list for valid input', () => {
  const list: LocationList = {
    locations: [validLocation],
  }
  assertDeepEqual(validateLocationList(list), list)
})

test('validateLocationList throws for invalid location', () => {
  assertThrows(() =>
    validateLocationList({
      locations: [{ id: 123 }],
    }),
  )
})

test('validateLocationList returns empty list', () => {
  const list: LocationList = { locations: [] }
  assertDeepEqual(validateLocationList(list), list)
})

test('validateLocationList returns list with multiple', () => {
  const list: LocationList = {
    locations: [
      validLocation,
      {
        id: 'd4e5f6a7-b8c9-0123-defa-234567890123',
        name: 'Oluthuone Panimomestari',
      },
    ],
  }
  assertDeepEqual(validateLocationList(list), list)
})

test('validateLocationListOrUndefined returns undefined for undefined', () => {
  assertDeepEqual(validateLocationListOrUndefined(undefined), undefined)
})

test('validateLocationListOrUndefined returns list for valid input', () => {
  const list: LocationList = {
    locations: [validLocation],
  }
  assertDeepEqual(validateLocationListOrUndefined(list), list)
})

test('validateLocationListOrUndefined throws for invalid location', () => {
  assertThrows(() =>
    validateLocationListOrUndefined({
      locations: [{ id: 123 }],
    }),
  )
})
