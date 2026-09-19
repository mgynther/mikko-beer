import { expect, test } from 'vitest'
import { waitForTurn } from './request-blocker'
import { Mutex } from 'async-mutex'

test('waits for turn', async () => {
  const mutex = new Mutex()
  const expected = ['delayed', 'immediate']
  const results: string[] = []

  const delayed = async (): Promise<void> => {
    const promise = new Promise((resolve) => {
      const callback = (): void => {
        results.push('delayed')
        resolve(undefined)
      }
      setTimeout(callback, 1)
    })
    await promise
  }

  const immediate = async (): Promise<void> => {
    results.push('immediate')
  }

  const promise1 = waitForTurn(mutex, delayed)
  const promise2 = waitForTurn(mutex, immediate)
  await Promise.all([promise1, promise2])
  expect(results).toEqual(expected)
})
