import { act, render, waitFor } from '@testing-library/react'
import { expect, test, vitest } from 'vitest'
import Breweries from './Breweries'
import type { SearchIf } from '../../core/search/types'
import LinkWrapper from '../LinkWrapper'
import type { UseDebounce } from '../../core/types'
import type { BreweryList, ListBreweriesIf } from '../../core/brewery/types'
import { loadingIndicatorText } from '../common/LoadingIndicator'

const useDebounce: UseDebounce<string> = str => [str, false]

const notUsed = (): any => { throw new Error('Do not call') }

const activeSearch: SearchIf = {
  useSearch: () => ({
    activate: notUsed,
    isActive: false
  }),
  useDebounce
}

const brewery = {
  id: 'e3fad94c-2408-4f8f-8e3f-2b2c30ae6bfb',
  name: 'Lehe pruulikoda'
}

const anotherBrewery = {
  id: 'b56107e2-9e92-4cbd-a0f1-bae25e44caa2',
  name: 'Purtse pruulikoda'
}

const breweries = [
  brewery,
  anotherBrewery
]

test('renders breweries', async () => {
  let scrollCb: (() => void) = () => undefined
  const listBreweriesIf: ListBreweriesIf = {
    useList: () => ({
      list: async () => ({
        breweries
      }),
      breweryList: { breweries },
      isLoading: false,
      isUninitialized: false
    }),
    infiniteScroll: (cb) => { scrollCb = cb; return () => undefined }
  }
  const { getByPlaceholderText, getByRole } = render(
    <LinkWrapper>
      <Breweries
        listBreweriesIf={listBreweriesIf}
        navigateIf={{
          useNavigate: () => notUsed
        }}
        searchBreweryIf={{
          useSearch: () => ({
            search: notUsed,
            isLoading: false
          })
        }}
        searchIf={activeSearch}
      />
    </LinkWrapper>
  )
  expect(scrollCb).not.toEqual(undefined)
  await act(async () => { scrollCb(); })
  getByRole('link', { name: brewery.name })
  getByRole('link', { name: anotherBrewery.name })
  getByRole('textbox')
  getByPlaceholderText('Search brewery')
})

test('render loading', async () => {
  let scrollCb: (() => void) = () => undefined
  const listBreweriesIf: ListBreweriesIf = {
    useList: () => ({
      list: notUsed,
      breweryList: undefined,
      isLoading: true,
      isUninitialized: true
    }),
    infiniteScroll: (cb) => { scrollCb = cb; return () => undefined }
  }
  const { getByText } = render(
    <LinkWrapper>
      <Breweries
        listBreweriesIf={listBreweriesIf}
        navigateIf={{
          useNavigate: () => notUsed
        }}
        searchBreweryIf={{
          useSearch: () => ({
            search: notUsed,
            isLoading: false
          })
        }}
        searchIf={activeSearch}
      />
    </LinkWrapper>
  )
  await act(async () => { scrollCb(); })
  getByText(loadingIndicatorText)
})

test('stops loading more', async () => {
  const listMore = vitest.fn()
  let scrollCb: (() => void) = () => undefined
  function getListRequestCount(): number {
    return listMore.mock.calls.length
  }
  const listBreweriesIf: ListBreweriesIf = {
    useList: () => ({
      list: async (params): Promise<BreweryList> => {
        listMore(params)
        if (getListRequestCount() > 1) {
          return {
            breweries: []
          }
        }
        return {
          breweries
        }
      },
      breweryList: {
        breweries: getListRequestCount() > 1 ? [] : [brewery]
      },
      isLoading: false,
      isUninitialized: false
    }),
    infiniteScroll: (cb) => { scrollCb = cb; return () => undefined }
  }
  const { getByText } = render(
    <LinkWrapper>
      <Breweries
        listBreweriesIf={listBreweriesIf}
        navigateIf={{
          useNavigate: () => notUsed
        }}
        searchBreweryIf={{
          useSearch: () => ({
            search: notUsed,
            isLoading: false
          })
        }}
        searchIf={activeSearch}
      />
    </LinkWrapper>
  )
  scrollCb()
  await waitFor(() => getByText(brewery.name))
  // No more visible changes on UI so act is needed.
  await act(async () => { scrollCb(); })
  expect(listMore.mock.calls).toEqual([
    [
      {
        size: 20,
        skip: 0
      }
    ],
    [
      {
        size: 20,
        skip: 2
      }
    ]
  ])
  await act(async () => { scrollCb(); })
  expect(listMore).toHaveBeenCalledTimes(2)
})
