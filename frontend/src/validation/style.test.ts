import { expect, test } from 'vitest'

import type {
  Style,
  StyleList,
  StyleWithParentsAndChildren
} from '../core/style/types'

import {
  validateStyle,
  validateStyleOrUndefined,
  validateStyleWithParentsAndChildren,
  validateStyleWithParentsAndChildrenOrUndefined,
  validateStyleList,
  validateStyleListOrUndefined
} from './style'

const validStyle: Style = {
  id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  name: 'Imperial Stout'
}

test('validateStyle returns style for valid input', () => {
  expect(validateStyle(validStyle)).toEqual(validStyle)
})

test('validateStyle throws for invalid input', () => {
  expect(() => validateStyle({
    id: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
    name: 123
  })).toThrow()
})

test('validateStyleOrUndefined returns undefined for undefined', () => {
  expect(validateStyleOrUndefined(undefined))
    .toEqual(undefined)
})

test('validateStyleOrUndefined returns style for valid input', () => {
  expect(validateStyleOrUndefined(validStyle))
    .toEqual(validStyle)
})

test('validateStyleOrUndefined throws for invalid input', () => {
  expect(() => validateStyleOrUndefined({
    id: 'c3d4e5f6-a7b8-9012-cdef-123456789012'
  })).toThrow()
})

const validStyleWithParentsAndChildren: StyleWithParentsAndChildren = {
  id: 'd4e5f6a7-b8c9-0123-defa-234567890123',
  name: 'Baltic Porter',
  children: [
    {
      id: 'e5f6a7b8-c9d0-1234-efab-345678901234',
      name: 'Imperial Baltic Porter'
    }
  ],
  parents: [
    {
      id: 'f6a7b8c9-d0e1-2345-fabc-456789012345',
      name: 'Porter'
    }
  ]
}

test(
  'validateStyleWithParentsAndChildren returns style for valid input',
  () => {
    expect(validateStyleWithParentsAndChildren(
      validStyleWithParentsAndChildren
    )).toEqual(validStyleWithParentsAndChildren)
  }
)

test(
  'validateStyleWithParentsAndChildren returns style with empty arrays',
  () => {
    const style: StyleWithParentsAndChildren = {
      id: '11223344-5566-7788-99aa-bbccddeeff00',
      name: 'Lager',
      children: [],
      parents: []
    }
    expect(validateStyleWithParentsAndChildren(style))
      .toEqual(style)
  }
)

test(
  'validateStyleWithParentsAndChildren throws for invalid input',
  () => {
    expect(() => validateStyleWithParentsAndChildren({
      id: '22334455-6677-8899-aabb-ccddeeff0011',
      name: 'Porter',
      children: [{ id: 123 }]
    })).toThrow()
  }
)

test(
  'validateStyleWithParentsAndChildrenOrUndefined returns undefined',
  () => {
    expect(validateStyleWithParentsAndChildrenOrUndefined(undefined))
      .toEqual(undefined)
  }
)

test(
  'validateStyleWithParentsAndChildrenOrUndefined returns style',
  () => {
    expect(validateStyleWithParentsAndChildrenOrUndefined(
      validStyleWithParentsAndChildren
    )).toEqual(validStyleWithParentsAndChildren)
  }
)

test(
  'validateStyleWithParentsAndChildrenOrUndefined throws for invalid',
  () => {
    expect(() => validateStyleWithParentsAndChildrenOrUndefined({
      id: '33445566-7788-99aa-bbcc-ddeeff001122'
    })).toThrow()
  }
)

const validStyleList: StyleList = {
  styles: [
    {
      id: '44556677-8899-aabb-ccdd-eeff00112233',
      name: 'IPA',
      parents: ['55667788-99aa-bbcc-ddee-ff0011223344']
    }
  ]
}

test('validateStyleList returns list for valid input', () => {
  expect(validateStyleList(validStyleList))
    .toEqual(validStyleList)
})

test('validateStyleList returns empty list', () => {
  const list: StyleList = { styles: [] }
  expect(validateStyleList(list)).toEqual(list)
})

test('validateStyleList throws for invalid input', () => {
  expect(() => validateStyleList({
    styles: [{ id: 123 }]
  })).toThrow()
})

test(
  'validateStyleListOrUndefined returns undefined for undefined',
  () => {
    expect(validateStyleListOrUndefined(undefined))
      .toEqual(undefined)
  }
)

test(
  'validateStyleListOrUndefined returns list for valid input',
  () => {
    expect(validateStyleListOrUndefined(validStyleList))
      .toEqual(validStyleList)
  }
)

test(
  'validateStyleListOrUndefined throws for invalid input',
  () => {
    expect(() => validateStyleListOrUndefined({
      styles: [{ id: 123 }]
    })).toThrow()
  }
)
