import { fireEvent as libraryFireEvent } from '@testing-library/react'

// Wraps the events testing library fires directly, for the inputs user-event
// cannot drive, so that tests depend on this file rather than on the library
// and only the events the tests use are available to them.

interface ChangeInit {
  target: {
    value: string
  }
}

interface FireEvent {
  change: (element: Element, init: ChangeInit) => void
  mouseDown: (element: Element) => void
  mouseUp: (element: Element) => void
  touchStart: (element: Element) => void
  touchEnd: (element: Element) => void
}

export const fireEvent: FireEvent = {
  change: (element, init) => {
    libraryFireEvent.change(element, init)
  },
  mouseDown: (element) => {
    libraryFireEvent.mouseDown(element)
  },
  mouseUp: (element) => {
    libraryFireEvent.mouseUp(element)
  },
  touchStart: (element) => {
    libraryFireEvent.touchStart(element)
  },
  touchEnd: (element) => {
    libraryFireEvent.touchEnd(element)
  },
}
