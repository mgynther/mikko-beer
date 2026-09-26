import userEvent from '@testing-library/user-event'
import type { Options, UserEvent } from '@testing-library/user-event'

export type { UserEvent }

// user-event waits a macro task after every event by default which is dead
// time in tests. It has no global configuration so the delay is set here for
// every test instead of at each call site. Tests that need the wait can pass
// a delay of their own.
export function setupUser(options: Options = {}): UserEvent {
  return userEvent.setup({ delay: null, ...options })
}
