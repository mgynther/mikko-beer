import { expect, test } from 'vitest'

import type { Container, ContainerList } from '../core/container/types'

import {
  validateContainer,
  validateContainerListOrUndefined,
} from './container'

const validContainer: Container = {
  id: '31192a98-753c-4d05-a2b1-9959d24e198c',
  type: 'Bottle',
  size: '0.33',
}

test('validateContainer returns container for valid input', () => {
  expect(validateContainer(validContainer)).toEqual(validContainer)
})

test('validateContainer throws for invalid input', () => {
  expect(() => validateContainer({ id: 123 })).toThrow()
})

test('validateContainer throws for missing type', () => {
  expect(() =>
    validateContainer({
      id: 'dec7d08e-f5ba-43f5-a437-b9e02aaf0cb1',
      size: '0.50',
    }),
  ).toThrow()
})

test('validateContainer throws for missing size', () => {
  expect(() =>
    validateContainer({
      id: 'fa582513-0ee9-4873-96a3-24bd92d7817d',
      type: 'Can',
    }),
  ).toThrow()
})

test('validateContainer throws for non-string type', () => {
  expect(() =>
    validateContainer({
      id: '8d0b4708-d512-4a78-8c15-98091e9f1aa3',
      type: 123,
      size: '0.50',
    }),
  ).toThrow()
})

test('validateContainerListOrUndefined returns undefined for undefined', () => {
  expect(validateContainerListOrUndefined(undefined)).toEqual(undefined)
})

test('validateContainerListOrUndefined returns list for valid input', () => {
  const list: ContainerList = {
    containers: [validContainer],
  }
  expect(validateContainerListOrUndefined(list)).toEqual(list)
})

test('validateContainerListOrUndefined throws for invalid input', () => {
  expect(() =>
    validateContainerListOrUndefined({
      containers: 'wrong',
    }),
  ).toThrow()
})

test('validateContainerListOrUndefined throws for invalid container', () => {
  expect(() =>
    validateContainerListOrUndefined({
      containers: [{ id: 123 }],
    }),
  ).toThrow()
})

test('validateContainerListOrUndefined returns empty list', () => {
  const list: ContainerList = { containers: [] }
  expect(validateContainerListOrUndefined(list)).toEqual(list)
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
  expect(validateContainerListOrUndefined(list)).toEqual(list)
})
