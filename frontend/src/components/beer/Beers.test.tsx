import { act, render, waitFor } from '@testing-library/react'
import { expect, test, vitest } from 'vitest'
import Beers from './Beers'
import type { SearchIf } from '../../core/search/types'
import LinkWrapper from '../LinkWrapper'
import type { UseDebounce } from '../../core/types'
import type { BeerList, ListBeersIf, SearchBeerIf } from '../../core/beer/types'
import type { NavigateIf } from '../util'
import { loadingIndicatorText } from '../common/LoadingIndicator'

const useDebounce: UseDebounce<string> = (str) => [str, false]

const notUsed = (): any => {
  throw new Error('Do not call')
}

const activeSearch: SearchIf = {
  useSearch: () => ({
    activate: notUsed,
    isActive: false,
  }),
  useDebounce,
}

const brewery = {
  id: '8e8f7718-f494-4787-b497-c6f1ad7a6e3c',
  name: 'Mad Hopper',
}

const breweries = [brewery]

const style = {
  id: '0866e685-1b0e-4c1a-8475-a3335ddedd8d',
  name: 'Imperial Stout',
  parents: [],
}

const styles = [style]

const beer = {
  breweries,
  id: 'e3fad94c-2408-4f8f-8e3f-2b2c30ae6bfb',
  name: 'Parallax',
  styles,
}

const anotherBeer = {
  breweries,
  id: 'b56107e2-9e92-4cbd-a0f1-bae25e44caa2',
  name: 'Blueberry Cheesecake',
  styles,
}

const beers = [beer, anotherBeer]

const navigateIf: NavigateIf = {
  useNavigate: () => notUsed,
}

const searchBeerIf: SearchBeerIf = {
  useSearch: () => ({
    search: notUsed,
    isLoading: false,
  }),
}

test('render beers', async () => {
  let scrollCb: () => void = () => undefined
  const listBeersIf: ListBeersIf = {
    useList: () => ({
      list: async () => ({
        beers,
      }),
      beerList: { beers },
      isLoading: false,
      isUninitialized: false,
    }),
    infiniteScroll: (cb) => {
      scrollCb = cb
      return () => undefined
    },
  }
  const { getByPlaceholderText, getAllByRole, getByRole } = render(
    <LinkWrapper>
      <Beers
        listBeersIf={listBeersIf}
        navigateIf={navigateIf}
        searchBeerIf={searchBeerIf}
        searchIf={activeSearch}
      />
    </LinkWrapper>,
  )
  expect(scrollCb).not.toEqual(undefined)
  await act(async () => {
    scrollCb()
  })
  getByRole('link', { name: beer.name })
  getByRole('link', { name: anotherBeer.name })
  getAllByRole('link', { name: brewery.name })
  getAllByRole('link', { name: style.name })
  getByRole('textbox')
  getByPlaceholderText('Search beer')
})

test('render loading', async () => {
  let scrollCb: () => void = () => undefined
  const listBeersIf: ListBeersIf = {
    useList: () => ({
      list: async () => ({
        beers,
      }),
      beerList: undefined,
      isLoading: true,
      isUninitialized: true,
    }),
    infiniteScroll: (cb) => {
      scrollCb = cb
      return () => undefined
    },
  }
  const { getByText } = render(
    <LinkWrapper>
      <Beers
        listBeersIf={listBeersIf}
        navigateIf={navigateIf}
        searchBeerIf={searchBeerIf}
        searchIf={activeSearch}
      />
    </LinkWrapper>,
  )
  await act(async () => {
    scrollCb()
  })
  getByText(loadingIndicatorText)
})

test('stops loading more', async () => {
  const listMore = vitest.fn()
  let scrollCb: () => void = () => undefined
  function getListRequestCount(): number {
    return listMore.mock.calls.length
  }
  const listBeersIf: ListBeersIf = {
    useList: () => ({
      list: async (params): Promise<BeerList> => {
        listMore(params)
        if (getListRequestCount() > 1) {
          return {
            beers: [],
          }
        }
        return {
          beers,
        }
      },
      beerList: {
        beers: getListRequestCount() > 1 ? [] : [beer],
      },
      isLoading: false,
      isUninitialized: false,
    }),
    infiniteScroll: (cb) => {
      scrollCb = cb
      return () => undefined
    },
  }
  const { getByText } = render(
    <LinkWrapper>
      <Beers
        listBeersIf={listBeersIf}
        navigateIf={navigateIf}
        searchBeerIf={searchBeerIf}
        searchIf={activeSearch}
      />
    </LinkWrapper>,
  )
  // act is important to ensure changes have been fully applied. loading is not
  // toggled between renders so without act there would be a race condition in
  // the test execution.
  await act(async () => {
    scrollCb()
  })
  await waitFor(() => getByText(beer.name))
  await act(async () => {
    scrollCb()
  })
  expect(listMore.mock.calls).toEqual([
    [
      {
        size: 20,
        skip: 0,
      },
    ],
    [
      {
        size: 20,
        skip: 2,
      },
    ],
  ])
  await act(async () => {
    scrollCb()
  })
  expect(listMore).toHaveBeenCalledTimes(2)
})
