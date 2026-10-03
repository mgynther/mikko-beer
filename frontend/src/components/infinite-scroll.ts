import type { InfiniteScroll } from './types/types'
import { className as contentEndClassName } from './ContentEnd'

// The part of IntersectionObserver that infinite scrolling uses. The
// constructor arrives as an argument because jsdom, where the tests run, has
// none.
export type ObserverConstructor = new (
  callback: (entries: { isIntersecting: boolean }[]) => void,
) => {
  observe: (element: Element) => void
  unobserve: (element: Element) => void
}

export function createInfiniteScroll(
  IntersectionObserver: ObserverConstructor,
): InfiniteScroll {
  return (loadMore: () => void): (() => void) => {
    const element = document.getElementById(contentEndClassName)
    if (element === null) {
      return (): void => {}
    }
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        loadMore()
      }
    })
    observer.observe(element)
    return (): void => {
      observer.unobserve(element)
    }
  }
}
