import { expect, test } from 'vitest'

import type {
  Location,
  LocationList
} from '../core/location/types'

import {
  validateLocation,
  validateLocationOrUndefined,
  validateLocationList,
  validateLocationListOrUndefined
} from './location'

const validLocation: Location = {
  id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  name: 'Kuja Beer Shop & Bar'
}

test('validateLocation returns location for valid input', () => {
  expect(validateLocation(validLocation)).toEqual(validLocation)
})

test('validateLocation throws for invalid input', () => {
  expect(() => validateLocation({
    id: 'b2c3d4e5-f6a7-8901-bcde-f12345678901'
  })).toThrow()
})

test('validateLocationOrUndefined returns undefined for undefined', () => {
  expect(validateLocationOrUndefined(undefined))
  .toEqual(undefined)
})

test('validateLocationOrUndefined returns location for valid input', () => {
  expect(validateLocationOrUndefined(validLocation))
  .toEqual(validLocation)
})

test('validateLocationOrUndefined throws for invalid input', () => {
  expect(() => validateLocationOrUndefined({ name: 'id missing' }))
    .toThrow()
})

test('validateLocationList returns list for valid input', () => {
  const list: LocationList = {
    locations: [validLocation]
  }
  expect(validateLocationList(list)).toEqual(list)
})

test('validateLocationList throws for invalid location', () => {
  expect(() => validateLocationList({
    locations: [{ id: 123 }]
  })).toThrow()
})

test('validateLocationList returns empty list', () => {
  const list: LocationList = { locations: [] }
  expect(validateLocationList(list)).toEqual(list)
})

test('validateLocationList returns list with multiple', () => {
  const list: LocationList = {
    locations: [
      validLocation,
      {
        id: 'd4e5f6a7-b8c9-0123-defa-234567890123',
        name: 'Oluthuone Panimomestari'
      }
    ]
  }
  expect(validateLocationList(list)).toEqual(list)
})

test('validateLocationListOrUndefined returns undefined for undefined', () => {
  expect(validateLocationListOrUndefined(undefined))
  .toEqual(undefined)
})

test('validateLocationListOrUndefined returns list for valid input', () => {
  const list: LocationList = {
    locations: [validLocation]
  }
  expect(validateLocationListOrUndefined(list)).toEqual(list)
})

test('validateLocationListOrUndefined throws for invalid location', () => {
  expect(() => validateLocationListOrUndefined({
    locations: [{ id: 123 }]
  })).toThrow()
})
