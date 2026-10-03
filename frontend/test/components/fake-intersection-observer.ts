import type { ObserverConstructor } from '../../src/components/infinite-scroll'

type Callback = (entries: { isIntersecting: boolean }[]) => void

// A browser reports what an observer observes coming into view and going out
// of it; a test says when that happens with intersect. An observer that
// observes nothing hears nothing, as it would in a browser.
export interface FakeIntersectionObserver {
  IntersectionObserver: ObserverConstructor
  intersect: (isIntersecting: boolean) => void
  observed: () => Element[]
}

export function createFakeIntersectionObserver(): FakeIntersectionObserver {
  const observers: FakeObserver[] = []

  class FakeObserver {
    readonly callback: Callback
    readonly elements: Element[] = []

    constructor(callback: Callback) {
      this.callback = callback
      observers.push(this)
    }

    observe(element: Element): void {
      this.elements.push(element)
    }

    unobserve(element: Element): void {
      this.elements.splice(this.elements.indexOf(element), 1)
    }
  }

  return {
    IntersectionObserver: FakeObserver,
    intersect: (isIntersecting: boolean): void => {
      observers
        .filter((observer) => observer.elements.length > 0)
        .forEach((observer) => {
          observer.callback(observer.elements.map(() => ({ isIntersecting })))
        })
    },
    observed: (): Element[] =>
      observers.flatMap((observer) => observer.elements),
  }
}
