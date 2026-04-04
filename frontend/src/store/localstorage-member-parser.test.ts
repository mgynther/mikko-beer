import { expect, test } from "vitest"
import { asObject } from "./localstorage-member-parser"

test('defaults to empty object on null', () => {
  const result = asObject(null)
  expect(result).toEqual({})
})

test('defaults to empty object on undefined', () => {
  const result = asObject(undefined)
  expect(result).toEqual({})
})

test('returns object on a valid object', () => {
  const obj = { test: 123 }
  const result = asObject(obj)
  expect(result).toEqual(obj)
})
