import { test } from '../test'
import { assertDeepEqual, assertThrowsWithMessage } from '../assert'
import {
  unwrapMember,
  unwrapMemberOrUndefined,
} from '../../src/storehooks/envelope'

test('unwrap member', () => {
  assertDeepEqual(unwrapMember({ beer: { id: 'id' } }, 'beer'), { id: 'id' })
})

test('unwrap undefined member', () => {
  assertDeepEqual(unwrapMember({ beer: undefined }, 'beer'), undefined)
})

test('fail to unwrap missing member', () => {
  assertThrowsWithMessage(
    () => unwrapMember({ bear: { id: 'id' } }, 'beer'),
    'Could not unwrap data: missing member beer',
  )
})

test('fail to unwrap non-object', () => {
  assertThrowsWithMessage(
    () => unwrapMember('beer', 'beer'),
    'Could not unwrap data: expected an object, got string',
  )
})

test('fail to unwrap null', () => {
  assertThrowsWithMessage(
    () => unwrapMember(null, 'beer'),
    'Could not unwrap data: expected an object, got object',
  )
})

test('fail to unwrap array', () => {
  assertThrowsWithMessage(
    () => unwrapMember([{ id: 'id' }], 'beer'),
    'Could not unwrap data: expected an object, got object',
  )
})

test('unwrap member or undefined', () => {
  assertDeepEqual(unwrapMemberOrUndefined({ beer: { id: 'id' } }, 'beer'), {
    id: 'id',
  })
})

test('unwrap undefined or undefined', () => {
  assertDeepEqual(unwrapMemberOrUndefined(undefined, 'beer'), undefined)
})
