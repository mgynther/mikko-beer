import { act, render } from '@testing-library/react'
import React, { useState } from 'react'
import { expect, test, vitest } from 'vitest'

import { setupUser } from '../../../../test-util/user-event'

import { useLoadMore } from './use-load-more'

// The sentinel at the end of the content is a button here: clicking it is the
// end of the content coming into view.
const scroll = 'scroll'
const reset = 'reset'
const notLoaded = 'not loaded'

interface Props {
  hasMore: boolean
  isLoading: boolean
  loadPage: (skip: number) => Promise<string[]>
}

function LoadMore(props: Props): React.JSX.Element {
  const [items, setItems] = useState<string[] | undefined>(undefined)
  const checkLoad = useLoadMore({
    hasMore: props.hasMore,
    isLoading: props.isLoading,
    items,
    loadPage: props.loadPage,
    setItems,
  })
  return (
    <div>
      <button
        onClick={() => {
          checkLoad()
        }}
      >
        {scroll}
      </button>
      <button
        onClick={() => {
          setItems(() => undefined)
        }}
      >
        {reset}
      </button>
      <div>{items === undefined ? notLoaded : `items: ${items.join(' ')}`}</div>
    </div>
  )
}

interface Deferred {
  page: Promise<string[]>
  resolve: (page: string[]) => void
}

function deferredPage(): Deferred {
  let resolve: (page: string[]) => void = () => undefined
  const page = new Promise<string[]>((res) => {
    resolve = res
  })
  return { page, resolve }
}

test('loads the first page', async () => {
  const loadPage = vitest.fn()
  const user = setupUser()
  const { getByRole, getByText } = render(
    <LoadMore
      hasMore={true}
      isLoading={false}
      loadPage={async (skip: number) => {
        loadPage(skip)
        return ['a', 'b']
      }}
    />,
  )
  await user.click(getByRole('button', { name: scroll }))
  expect(loadPage.mock.calls).toEqual([[0]])
  getByText('items: a b')
})

test('loads the next page after the ones it has', async () => {
  const loadPage = vitest.fn()
  const user = setupUser()
  const { getByRole, getByText } = render(
    <LoadMore
      hasMore={true}
      isLoading={false}
      loadPage={async (skip: number) => {
        loadPage(skip)
        return skip === 0 ? ['a', 'b'] : ['c']
      }}
    />,
  )
  await user.click(getByRole('button', { name: scroll }))
  await user.click(getByRole('button', { name: scroll }))
  expect(loadPage.mock.calls).toEqual([[0], [2]])
  getByText('items: a b c')
})

test('loads an empty page, which is a loaded list of nothing', async () => {
  const user = setupUser()
  const { getByRole, getByText } = render(
    <LoadMore hasMore={true} isLoading={false} loadPage={async () => []} />,
  )
  getByText(notLoaded)
  await user.click(getByRole('button', { name: scroll }))
  getByText('items:')
})

test('does not load again while a page is on its way', async () => {
  const loadPage = vitest.fn()
  const deferred = deferredPage()
  const user = setupUser()
  const { getByRole, getByText } = render(
    <LoadMore
      hasMore={true}
      isLoading={false}
      loadPage={async (skip: number) => {
        loadPage(skip)
        return await deferred.page
      }}
    />,
  )
  await user.click(getByRole('button', { name: scroll }))
  await user.click(getByRole('button', { name: scroll }))
  await user.click(getByRole('button', { name: scroll }))
  // The render that would say a request is running has not happened yet, so
  // the lock rather than the rendered isLoading is what is being tested here.
  expect(loadPage.mock.calls).toEqual([[0]])
  await act(async () => {
    deferred.resolve(['a'])
  })
  getByText('items: a')
  await user.click(getByRole('button', { name: scroll }))
  expect(loadPage.mock.calls).toEqual([[0], [1]])
})

test('does not load while the caller says it is loading', async () => {
  const loadPage = vitest.fn()
  const user = setupUser()
  const { getByRole } = render(
    <LoadMore
      hasMore={true}
      isLoading={true}
      loadPage={async (skip: number) => {
        loadPage(skip)
        return []
      }}
    />,
  )
  await user.click(getByRole('button', { name: scroll }))
  expect(loadPage.mock.calls).toEqual([])
})

test('does not load when there is nothing more', async () => {
  const loadPage = vitest.fn()
  const user = setupUser()
  const { getByRole } = render(
    <LoadMore
      hasMore={false}
      isLoading={false}
      loadPage={async (skip: number) => {
        loadPage(skip)
        return []
      }}
    />,
  )
  await user.click(getByRole('button', { name: scroll }))
  expect(loadPage.mock.calls).toEqual([])
})

test('drops a page of a list that has moved on', async () => {
  const deferred = deferredPage()
  const user = setupUser()
  const { getByRole, getByText } = render(
    <LoadMore
      hasMore={true}
      isLoading={false}
      loadPage={async (skip: number) =>
        skip === 0 ? ['a', 'b'] : await deferred.page
      }
    />,
  )
  await user.click(getByRole('button', { name: scroll }))
  getByText('items: a b')
  // The second page is on its way when a sort or a filter change empties the
  // list under it. Adding it to what it was asked for would put the list
  // back, and the page after it would then repeat rows the list already had.
  await user.click(getByRole('button', { name: scroll }))
  await user.click(getByRole('button', { name: reset }))
  await act(async () => {
    deferred.resolve(['c'])
  })
  getByText(notLoaded)
})

test('loads again after a page that failed', async () => {
  const loadPage = vitest.fn()
  let hasFailed = false
  const user = setupUser()
  const { getByRole, getByText } = render(
    <LoadMore
      hasMore={true}
      isLoading={false}
      loadPage={async (skip: number) => {
        loadPage(skip)
        if (!hasFailed) {
          hasFailed = true
          throw new Error('page failed')
        }
        return ['a']
      }}
    />,
  )
  await user.click(getByRole('button', { name: scroll }))
  getByText(notLoaded)
  await user.click(getByRole('button', { name: scroll }))
  expect(loadPage.mock.calls).toEqual([[0], [0]])
  getByText('items: a')
})
