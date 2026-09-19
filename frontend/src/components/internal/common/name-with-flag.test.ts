import { expect, test } from 'vitest'

import { nameWithFlag } from './name-with-flag'

const name = 'Lehe pruulikoda'

test('combines name and flag', () => {
  expect(nameWithFlag(name, 'EE')).toEqual(`${name} \u{1F1EA}\u{1F1EA}`)
})

test('gives plain name for lower case country code', () => {
  expect(nameWithFlag(name, 'ee')).toEqual(name)
})

test('gives plain name without country code', () => {
  expect(nameWithFlag(name, undefined)).toEqual(name)
})

test('gives plain name for empty country code', () => {
  expect(nameWithFlag(name, '')).toEqual(name)
})

test('gives plain name for too short country code', () => {
  expect(nameWithFlag(name, 'E')).toEqual(name)
})

test('gives plain name for too long country code', () => {
  expect(nameWithFlag(name, 'EST')).toEqual(name)
})

test('gives plain name for invalid country code', () => {
  expect(nameWithFlag(name, '12')).toEqual(name)
})

test('gives plain empty name', () => {
  expect(nameWithFlag('', undefined)).toEqual('')
})
