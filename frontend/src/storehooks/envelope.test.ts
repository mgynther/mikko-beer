import { expect, test } from 'vitest'
import { unwrapMember, unwrapMemberOrUndefined } from './envelope'

test('unwrap member', () => {
  expect(unwrapMember({ beer: { id: 'id' } }, 'beer')).toEqual({ id: 'id' })
})

test('unwrap undefined member', () => {
  expect(unwrapMember({ beer: undefined }, 'beer')).toEqual(undefined)
})

test('fail to unwrap missing member', () => {
  expect(() => unwrapMember({ bear: { id: 'id' } }, 'beer')).toThrow(
    'Could not unwrap data: missing member beer',
  )
})

test('fail to unwrap non-object', () => {
  expect(() => unwrapMember('beer', 'beer')).toThrow(
    'Could not unwrap data: expected an object, got string',
  )
})

test('fail to unwrap null', () => {
  expect(() => unwrapMember(null, 'beer')).toThrow(
    'Could not unwrap data: expected an object, got object',
  )
})

test('fail to unwrap array', () => {
  expect(() => unwrapMember([{ id: 'id' }], 'beer')).toThrow(
    'Could not unwrap data: expected an object, got object',
  )
})

test('unwrap member or undefined', () => {
  expect(unwrapMemberOrUndefined({ beer: { id: 'id' } }, 'beer')).toEqual({
    id: 'id',
  })
})

test('unwrap undefined or undefined', () => {
  expect(unwrapMemberOrUndefined(undefined, 'beer')).toEqual(undefined)
})
