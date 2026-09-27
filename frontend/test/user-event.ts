import userEvent from '@testing-library/user-event'

// Wraps user-event so that tests depend on this file rather than on the
// library, and so that only the interactions the tests use are available to
// them. The type is restated rather than taken from the library for the same
// reason: an interaction that tests start to need is added here.
export interface UserEvent {
  clear: (element: Element) => Promise<void>
  click: (element: Element) => Promise<void>
  paste: (text: string) => Promise<void>
  selectOptions: (element: Element, values: HTMLElement) => Promise<void>
  type: (element: Element, text: string) => Promise<void>
}

// user-event waits a macro task after every event by default which is dead
// time in tests. It has no global configuration so the delay is set here for
// every test instead of at each call site.
export function setupUser(): UserEvent {
  return userEvent.setup({ delay: null })
}
