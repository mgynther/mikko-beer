import type { Mutex } from 'async-mutex'

export async function waitForTurn(
  mutex: Mutex,
  func: () => Promise<void>,
): Promise<void> {
  if (mutex.isLocked()) {
    await mutex.waitForUnlock()
    await func()
  } else {
    const release = await mutex.acquire()
    try {
      await func()
    } finally {
      release()
    }
  }
}
