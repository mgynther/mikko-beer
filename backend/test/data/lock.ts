import type { Database, Transaction } from '../../src/data/database.js'
import { assertDeepEqual } from '../assert.js'

// Locks in one transaction, holds the lock for a while, and meanwhile writes
// the locked row in another. Without the lock the write finishes well within
// the wait, and the events come out in the other order.
export async function assertLockHoldsOffWrite(
  db: Database,
  lock: (trx: Transaction) => Promise<unknown>,
  write: (trx: Transaction) => Promise<unknown>,
): Promise<void> {
  const events: string[] = []
  let locked: () => void = () => undefined
  const wasLocked = new Promise<void>((resolve) => {
    locked = resolve
  })

  const locking = db.executeReadWriteTransaction(async (trx: Transaction) => {
    await lock(trx)
    locked()
    await new Promise((resolve) => setTimeout(resolve, 100))
    events.push('locking transaction ended')
  })
  await wasLocked
  const writing = db.executeReadWriteTransaction(async (trx: Transaction) => {
    await write(trx)
    events.push('written')
  })
  await Promise.all([locking, writing])

  assertDeepEqual(events, ['locking transaction ended', 'written'])
}
