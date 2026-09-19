import { expect, test } from 'vitest'

import { flagEmoji } from './flag-emoji'

test('converts Finnish country code', () => {
  expect(flagEmoji('FI')).toEqual('\u{1F1EB}\u{1F1EE}')
})

test('converts Estonian country code', () => {
  expect(flagEmoji('EE')).toEqual('\u{1F1EA}\u{1F1EA}')
})

test('converts British country code', () => {
  expect(flagEmoji('GB')).toEqual('\u{1F1EC}\u{1F1E7}')
})

test('converts Swedish country code', () => {
  expect(flagEmoji('SE')).toEqual('\u{1F1F8}\u{1F1EA}')
})

test('converts Belgian country code', () => {
  expect(flagEmoji('BE')).toEqual('\u{1F1E7}\u{1F1EA}')
})

test('converts first country code', () => {
  expect(flagEmoji('AA')).toEqual('\u{1F1E6}\u{1F1E6}')
})

test('converts last country code', () => {
  expect(flagEmoji('ZZ')).toEqual('\u{1F1FF}\u{1F1FF}')
})

test('gives undefined for lower case country code', () => {
  expect(flagEmoji('fi')).toEqual(undefined)
})

test('gives undefined for mixed case country code', () => {
  expect(flagEmoji('Fi')).toEqual(undefined)
})

test('gives undefined without country code', () => {
  expect(flagEmoji(undefined)).toEqual(undefined)
})

test('gives undefined for empty country code', () => {
  expect(flagEmoji('')).toEqual(undefined)
})

test('gives undefined for too short country code', () => {
  expect(flagEmoji('F')).toEqual(undefined)
})

test('gives undefined for too long country code', () => {
  expect(flagEmoji('FIN')).toEqual(undefined)
})

test('gives undefined for digit country code', () => {
  expect(flagEmoji('12')).toEqual(undefined)
})

test('gives undefined for non-latin country code', () => {
  expect(flagEmoji('ÄÖ')).toEqual(undefined)
})

test('gives undefined for whitespace country code', () => {
  expect(flagEmoji('F ')).toEqual(undefined)
})
