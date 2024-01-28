import '@testing-library/jest-dom'

import { type ListDirection } from '../store/types'
import { getDirectionSymbol, invertDirection } from './list-helpers'

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
