import { useCallback, useLayoutEffect, useRef } from 'react'
import { createErrorLogger } from '../error-logger'

export interface LoadMoreProps<T> {
  // Whether the list has a page left to load. The lists answer this from
  // what their last request returned, which is theirs to know.
  hasMore: boolean
  // The caller's own reason not to start a request yet, such as a filter
  // change that is still being debounced. The request this started is not
  // one of those reasons; that one is held by the lock below.
  isLoading: boolean
  items: T[] | undefined
  loadPage: (skip: number) => Promise<T[]>
  setItems: (update: (current: T[] | undefined) => T[] | undefined) => void
}

// What every infinitely scrolling list has to get right about loading a
// page, in one place rather than in each of them: which rows to ask for,
// and which list the rows that come back belong to.
//
// Two things went wrong while each list did this for itself.
//
// The guard against asking twice was `isLoading` as the last render saw it,
// captured in the effect that subscribed the callback. Observing an element
// reports its current intersection straight away, so the callback runs on
// every re-subscribe as well as on every scroll, and between a request
// being made and React rendering that one is in flight the captured value
// still says none is. The lock here is a ref, which is true from the
// moment the request starts, whatever React has rendered.
//
// The page was then added to the list the closure had captured, and nothing
// tied a response to the state it had been asked for. A response landing
// after a sort or a filter had reset the list wrote its page on top of a
// list that no longer existed, and the next skip, counted from the length
// that left behind, asked for rows the list already held. That is how the
// same row came to be in the table twice. The skip a page was asked for is
// therefore checked against the list it is about to be added to, and a page
// that no longer follows it is dropped.
export function useLoadMore<T>(props: LoadMoreProps<T>): () => void {
  const isLoadingRef = useRef(false)
  // The callback the sentinel holds outlives the render that made it, so it
  // reads what it needs from here rather than from a closure.
  //
  // A layout effect rather than an ordinary one, because an ordinary one is
  // run after the commit rather than as part of it. The sentinel can come
  // into view in that gap, and a callback reading a list one page shorter
  // than the one on the screen asks for a page the list already has.
  const latest = useRef(props)
  useLayoutEffect(() => {
    latest.current = props
  })

  return useCallback(() => {
    const { hasMore, isLoading, items, loadPage, setItems } = latest.current
    if (isLoadingRef.current) return
    if (isLoading) return
    if (!hasMore) return
    isLoadingRef.current = true
    const skip = items?.length ?? 0
    const load = async (): Promise<void> => {
      try {
        const page = await loadPage(skip)
        setItems((current) => {
          // The list moved on while the page was on its way: it was reset,
          // or another response was added to it first. The page is a page
          // of a list that is not this one any more.
          if ((current?.length ?? 0) !== skip) return current
          // An empty page is added as well, as a new array rather than the
          // one that is already there. Its own emptiness is not what ends
          // the list - the caller works that out from what the request
          // returned - so the render this causes is what the caller needs
          // in order to say so.
          return [...(current ?? []), ...page]
        })
      } finally {
        // A failed page releases the lock too, or one would wedge the list
        // for as long as it is on the screen.
        //
        // What that leaves is a list that asks again for a page that keeps
        // failing, as fast as it fails, while the end of the content is in
        // view. The lists did this before they had a lock and they still
        // do. Where a failure should stop the loading is a question for
        // whoever gives them a way to tell the user about one.
        isLoadingRef.current = false
      }
    }
    // Nothing above this has a way to report a failed page: the lists render
    // what they have and say nothing about what did not arrive. The console
    // is where it goes until one of them can say so.
    load().catch(createErrorLogger('loading a page failed', console.error))
  }, [])
}
