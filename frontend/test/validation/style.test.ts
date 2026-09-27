import { test } from '../test'
import { assertDeepEqual, assertThrows } from '../assert'

import type {
  Style,
  StyleList,
  StyleWithParentsAndChildren,
} from '../../src/validation/style'

import {
  validateStyle,
  validateStyleOrUndefined,
  validateStyleWithParentsAndChildren,
  validateStyleWithParentsAndChildrenOrUndefined,
  validateStyleList,
  validateStyleListOrUndefined,
} from '../../src/validation/style'

const validStyle: Style = {
  id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  name: 'Imperial Stout',
}

test('validateStyle returns style for valid input', () => {
  assertDeepEqual(validateStyle(validStyle), validStyle)
})

test('validateStyle throws for invalid input', () => {
  assertThrows(() =>
    validateStyle({
      id: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
      name: 123,
    }),
  )
})

test('validateStyleOrUndefined returns undefined for undefined', () => {
  assertDeepEqual(validateStyleOrUndefined(undefined), undefined)
})

test('validateStyleOrUndefined returns style for valid input', () => {
  assertDeepEqual(validateStyleOrUndefined(validStyle), validStyle)
})

test('validateStyleOrUndefined throws for invalid input', () => {
  assertThrows(() =>
    validateStyleOrUndefined({
      id: 'c3d4e5f6-a7b8-9012-cdef-123456789012',
    }),
  )
})

const validStyleWithParentsAndChildren: StyleWithParentsAndChildren = {
  id: 'd4e5f6a7-b8c9-0123-defa-234567890123',
  name: 'Baltic Porter',
  children: [
    {
      id: 'e5f6a7b8-c9d0-1234-efab-345678901234',
      name: 'Imperial Baltic Porter',
    },
  ],
  parents: [
    {
      id: 'f6a7b8c9-d0e1-2345-fabc-456789012345',
      name: 'Porter',
    },
  ],
}

test('validateStyleWithParentsAndChildren returns style for valid', () => {
  assertDeepEqual(
    validateStyleWithParentsAndChildren(validStyleWithParentsAndChildren),
    validStyleWithParentsAndChildren,
  )
})

test('validateStyleWithParentsAndChildren returns style for valid', () => {
  const style: StyleWithParentsAndChildren = {
    id: '11223344-5566-7788-99aa-bbccddeeff00',
    name: 'Lager',
    children: [],
    parents: [],
  }
  assertDeepEqual(validateStyleWithParentsAndChildren(style), style)
})

test('validateStyleWithParentsAndChildren throws for invalid input', () => {
  assertThrows(() =>
    validateStyleWithParentsAndChildren({
      id: '22334455-6677-8899-aabb-ccddeeff0011',
      name: 'Porter',
      children: [{ id: 123 }],
    }),
  )
})

test('validateStyleWithParentsAndChildrenOrUndefined returns undefined', () => {
  assertDeepEqual(
    validateStyleWithParentsAndChildrenOrUndefined(undefined),
    undefined,
  )
})

test('validateStyleWithParentsAndChildrenOrUndefined returns style', () => {
  assertDeepEqual(
    validateStyleWithParentsAndChildrenOrUndefined(
      validStyleWithParentsAndChildren,
    ),
    validStyleWithParentsAndChildren,
  )
})

test('validateStyleWithParentsAndChildrenOrUndefined throws', () => {
  assertThrows(() =>
    validateStyleWithParentsAndChildrenOrUndefined({
      id: '33445566-7788-99aa-bbcc-ddeeff001122',
    }),
  )
})

const validStyleList: StyleList = {
  styles: [
    {
      id: '44556677-8899-aabb-ccdd-eeff00112233',
      name: 'IPA',
      parents: ['55667788-99aa-bbcc-ddee-ff0011223344'],
    },
  ],
}

test('validateStyleList returns list for valid input', () => {
  assertDeepEqual(validateStyleList(validStyleList), validStyleList)
})

test('validateStyleList returns empty list', () => {
  const list: StyleList = { styles: [] }
  assertDeepEqual(validateStyleList(list), list)
})

test('validateStyleList throws for invalid input', () => {
  assertThrows(() =>
    validateStyleList({
      styles: [{ id: 123 }],
    }),
  )
})

test('validateStyleListOrUndefined returns undefined for undefined', () => {
  assertDeepEqual(validateStyleListOrUndefined(undefined), undefined)
})

test('validateStyleListOrUndefined returns list for valid input', () => {
  assertDeepEqual(validateStyleListOrUndefined(validStyleList), validStyleList)
})

test('validateStyleListOrUndefined throws for invalid input', () => {
  assertThrows(() =>
    validateStyleListOrUndefined({
      styles: [{ id: 123 }],
    }),
  )
})
