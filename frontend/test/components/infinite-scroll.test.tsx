import { test } from '../test'
import { assertCallCount, assertDeepEqual } from '../assert'
import { mockFunction } from '../mock'
import { render } from '../render'
import { createFakeIntersectionObserver } from './fake-intersection-observer'

import ContentEnd from '../../src/components/ContentEnd'
import { createInfiniteScroll } from '../../src/components/infinite-scroll'

test('observes the end of the content', () => {
  const { container } = render(<ContentEnd />)
  const observer = createFakeIntersectionObserver()
  createInfiniteScroll(observer.IntersectionObserver)(mockFunction<[]>())
  assertDeepEqual(observer.observed(), [...container.children])
})

test('loads more when the end of the content comes into view', () => {
  render(<ContentEnd />)
  const observer = createFakeIntersectionObserver()
  const loadMore = mockFunction<[]>()
  createInfiniteScroll(observer.IntersectionObserver)(loadMore)
  observer.intersect(true)
  assertCallCount(loadMore, 1)
})

test('does not load more when the end of the content goes out of view', () => {
  render(<ContentEnd />)
  const observer = createFakeIntersectionObserver()
  const loadMore = mockFunction<[]>()
  createInfiniteScroll(observer.IntersectionObserver)(loadMore)
  observer.intersect(false)
  assertCallCount(loadMore, 0)
})

test('stops observing when cleaned up', () => {
  render(<ContentEnd />)
  const observer = createFakeIntersectionObserver()
  const loadMore = mockFunction<[]>()
  const cleanUp = createInfiniteScroll(observer.IntersectionObserver)(loadMore)
  cleanUp()
  assertDeepEqual(observer.observed(), [])
  observer.intersect(true)
  assertCallCount(loadMore, 0)
})

test('observes nothing without an end of the content', () => {
  const observer = createFakeIntersectionObserver()
  const cleanUp = createInfiniteScroll(observer.IntersectionObserver)(
    mockFunction<[]>(),
  )
  cleanUp()
  assertDeepEqual(observer.observed(), [])
})
