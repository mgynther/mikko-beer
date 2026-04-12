import { expect, test } from "vitest";
import { createId, createLocationSort } from "./create-location-sort"
import type { Location } from '../../core/location/types'

interface SortTestCase {
  a: Location
  b: Location
  result: number
  label: string
}

const name = 'does not matter'

const sortTestCases: SortTestCase[] = [
  {
    a: {
      id: createId,
      name
    },
    b: {
      id: '4779c37c-49bd-4966-8778-e544648430a0',
      name
    },
    result: 1,
    label: 'create-new first'
  },
  {
    a: {
      id: '3355f0dd-2183-4e2f-97cc-03f2fab6fbc5',
      name
    },
    b: {
      id: createId,
      name
    },
    result: -1,
    label: 'create-new second'
  },
  {
    a: {
      id: '66b3d1d3-b92d-4614-8958-8749e5e6e901',
      name
    },
    b: {
      id: 'bd70483d-36b3-4080-8414-bb441473a3a7',
      name
    },
    result: 0,
    label: 'existing items'
  }
]

sortTestCases.forEach(testCase => {
  test(`sort create location: ${testCase.label}`, () => {
    const result = createLocationSort(testCase.a, testCase.b)
    expect(result).toEqual(testCase.result)
  })
})
