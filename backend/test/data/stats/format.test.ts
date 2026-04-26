import { describe, it } from 'node:test'

import { round, formatInteger } from '../../../src/data/stats/format.js'
import { assertEqual } from '../../assert.js'

describe('round', () => {
  it('rounds to two decimals', () => {
    assertEqual(round(7.123), '7.12')
  })

  it('rounds half away from zero', () => {
    assertEqual(round(7.125), '7.13')
  })

  it('pads to two decimals', () => {
    assertEqual(round(7), '7.00')
  })

  it('handles negative values', () => {
    assertEqual(round(-1.234), '-1.23')
  })

  it('returns sentinel for null', () => {
    assertEqual(round(null), '-')
  })

  it('returns sentinel for NaN', () => {
    assertEqual(round(NaN), '-')
  })
})

describe('formatInteger', () => {
  it('returns integer string', () => {
    assertEqual(formatInteger(9), '9')
  })

  it('rounds non-integer input to nearest integer', () => {
    assertEqual(formatInteger(9.4), '9')
    assertEqual(formatInteger(9.6), '10')
  })

  it('handles zero', () => {
    assertEqual(formatInteger(0), '0')
  })

  it('handles negative values', () => {
    assertEqual(formatInteger(-3.2), '-3')
  })

  it('returns sentinel for null', () => {
    assertEqual(formatInteger(null), '-')
  })

  it('returns sentinel for NaN', () => {
    assertEqual(formatInteger(NaN), '-')
  })
})
