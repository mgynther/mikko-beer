import '@testing-library/jest-dom'

import { type ListDirection } from '../store/types'
import {
  formatTitle,
  getDirectionSymbol,
  invertDirection
} from './list-helpers'

interface InvertTest {
  input: ListDirection | undefined
  output: ListDirection
}

const invertTests: InvertTest[] = [
  { input: 'asc', output: 'desc' },
  { input: 'desc', output: 'asc' },
  { input: undefined, output: 'desc' }
]

invertTests.forEach(testData => {
  test(`invert direction ${testData.input}`, () => {
    expect(invertDirection(testData.input)).toEqual(testData.output)
  })
})

interface DirectionSymbolTest {
  input: ListDirection | undefined
  output: string
}

const directionSymbolTests: DirectionSymbolTest[] = [
  { input: 'asc', output: '▲' },
  { input: 'desc', output: '▼' },
  { input: undefined, output: '' }
]

directionSymbolTests.forEach(testData => {
  test(`get direction symbol ${testData.input}`, () => {
    expect(getDirectionSymbol(testData.input)).toEqual(testData.output)
  })
})

interface FormatTitleTest {
  base: string
  isSelected: boolean
  direction: ListDirection | undefined
  output: string
}

const formatTitleTests: FormatTitleTest[] = [
  { base: 'Test', isSelected: false, direction: undefined, output: 'Test' },
  { base: 'Test', isSelected: true, direction: undefined, output: 'Test' },
  { base: 'Test', isSelected: true, direction: 'asc', output: 'Test ▲' },
  { base: 'Test', isSelected: true, direction: 'desc', output: 'Test ▼' },
  { base: 'Test', isSelected: false, direction: 'asc', output: 'Test' },
  { base: 'Test', isSelected: false, direction: 'desc', output: 'Test' },
]

formatTitleTests.forEach(({ base, isSelected, direction, output }) => {
  test(`format title ${
    base
  } isSelected ${
    isSelected
  } direction ${direction}`, () => {
    expect(formatTitle(base, isSelected, direction)).toEqual(output)
  })
})
