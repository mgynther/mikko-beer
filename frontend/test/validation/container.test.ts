import { test } from '../test'
import { assertDeepEqual, assertThrows } from '../assert'

import type { Container, ContainerList } from '../../src/validation/container'

import {
  validateContainer,
  validateContainerListOrUndefined,
} from '../../src/validation/container'

const validContainer: Container = {
  id: '31192a98-753c-4d05-a2b1-9959d24e198c',
  type: 'Bottle',
  size: '0.33',
}

test('validateContainer returns container for valid input', () => {
  assertDeepEqual(validateContainer(validContainer), validContainer)
})

test('validateContainer throws for invalid input', () => {
  assertThrows(() => validateContainer({ id: 123 }))
})

test('validateContainer throws for missing type', () => {
  assertThrows(() =>
    validateContainer({
      id: 'dec7d08e-f5ba-43f5-a437-b9e02aaf0cb1',
      size: '0.50',
    }),
  )
})

test('validateContainer throws for missing size', () => {
  assertThrows(() =>
    validateContainer({
      id: 'fa582513-0ee9-4873-96a3-24bd92d7817d',
      type: 'Can',
    }),
  )
})

test('validateContainer throws for non-string type', () => {
  assertThrows(() =>
    validateContainer({
      id: '8d0b4708-d512-4a78-8c15-98091e9f1aa3',
      type: 123,
      size: '0.50',
    }),
  )
})

test('validateContainerListOrUndefined returns undefined for undefined', () => {
  assertDeepEqual(validateContainerListOrUndefined(undefined), undefined)
})

test('validateContainerListOrUndefined returns list for valid input', () => {
  const list: ContainerList = {
    containers: [validContainer],
  }
  assertDeepEqual(validateContainerListOrUndefined(list), list)
})

test('validateContainerListOrUndefined throws for invalid input', () => {
  assertThrows(() =>
    validateContainerListOrUndefined({
      containers: 'wrong',
    }),
  )
})

test('validateContainerListOrUndefined throws for invalid container', () => {
  assertThrows(() =>
    validateContainerListOrUndefined({
      containers: [{ id: 123 }],
    }),
  )
})

test('validateContainerListOrUndefined returns empty list', () => {
  const list: ContainerList = { containers: [] }
  assertDeepEqual(validateContainerListOrUndefined(list), list)
})

test('validateContainerListOrUndefined returns list with multiple', () => {
  const list: ContainerList = {
    containers: [
      validContainer,
      {
        id: '54003286-b1d2-446b-a7b9-79ba157cc6f6',
        type: 'Can',
        size: '0.50',
      },
    ],
  }
  assertDeepEqual(validateContainerListOrUndefined(list), list)
})
