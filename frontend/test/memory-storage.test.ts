import { test } from './test'
import { assertEqual } from './assert'
import { createMemoryStorage } from './memory-storage'

test('gives back what was set', () => {
  const storage = createMemoryStorage()
  storage.setItem('key', 'value')
  assertEqual(storage.getItem('key'), 'value')
})

test('gives null for a key never set, as localStorage does', () => {
  const storage = createMemoryStorage()
  assertEqual(storage.getItem('key'), null)
})

test('gives null for a key removed', () => {
  const storage = createMemoryStorage()
  storage.setItem('key', 'value')
  storage.removeItem('key')
  assertEqual(storage.getItem('key'), null)
})

test('shares nothing with another storage', () => {
  const storage = createMemoryStorage()
  storage.setItem('key', 'value')
  assertEqual(createMemoryStorage().getItem('key'), null)
})
