import { act, render, waitFor } from '@testing-library/react'
import { expect, test, vitest } from 'vitest'
import Locations from './Locations'
import type { Location, LocationList } from '../../core/location/types'
import type { SearchIf } from '../../core/search/types'
import LinkWrapper from '../LinkWrapper'
import type { UseDebounce } from '../../core/types'
import type { CreateLocationIf } from '../../core/location/types'
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

const createLocationIf: CreateLocationIf = {
  useCreate: () => ({
    create: notUsed,
    isLoading: false,
  }),
}

const location = {
  id: 'e9d33373-596a-4a32-9878-098365b4fd62',
  name: 'Kahdet kasvot',
}

const anotherLocation = {
  id: 'c4c4f10c-0ce0-48b1-b366-e57d7fb3c9c9',
  name: 'Kultainen apina',
}

const locations: Location[] = [location, anotherLocation]

test('renders locations', async () => {
  let scrollCb: () => void = () => undefined
  const { getByPlaceholderText, getByRole } = render(
    <LinkWrapper>
      <Locations
        listLocationsIf={{
          useList: () => ({
            list: async (): Promise<LocationList> => ({
              locations,
            }),
            locationList: { locations },
            isLoading: false,
            isUninitialized: false,
          }),
          infiniteScroll: (cb): (() => undefined) => {
            scrollCb = cb
            return () => undefined
          },
        }}
        navigateIf={{
          useNavigate: () => notUsed,
        }}
        searchLocationIf={{
          useSearch: () => ({
            search: notUsed,
            isLoading: false,
          }),
          create: createLocationIf,
        }}
        searchIf={activeSearch}
      />
    </LinkWrapper>,
  )
  expect(scrollCb).not.toEqual(undefined)
  await act(async () => {
    scrollCb()
  })
  getByRole('link', { name: location.name })
  getByRole('link', { name: anotherLocation.name })
  getByRole('textbox')
  getByPlaceholderText('Search location')
})

test('renders loading', async () => {
  let scrollCb: () => void = () => undefined
  const { getByText } = render(
    <LinkWrapper>
      <Locations
        listLocationsIf={{
          useList: () => ({
            list: notUsed,
            locationList: undefined,
            isLoading: true,
            isUninitialized: true,
          }),
          infiniteScroll: (cb): (() => undefined) => {
            scrollCb = cb
            return () => undefined
          },
        }}
        navigateIf={{
          useNavigate: () => notUsed,
        }}
        searchLocationIf={{
          useSearch: () => ({
            search: notUsed,
            isLoading: false,
          }),
          create: createLocationIf,
        }}
        searchIf={activeSearch}
      />
    </LinkWrapper>,
  )
  scrollCb()
  await waitFor(() => getByText(loadingIndicatorText))
})

test('stops loading more', async () => {
  const listMore = vitest.fn()
  let scrollCb: () => void = () => undefined
  function getListRequestCount(): number {
    return listMore.mock.calls.length
  }
  const { getByText } = render(
    <LinkWrapper>
      <Locations
        listLocationsIf={{
          useList: () => ({
            list: async (params): Promise<LocationList> => {
              listMore(params)
              if (getListRequestCount() > 1) {
                return {
                  locations: [],
                }
              }
              return {
                locations,
              }
            },
            locationList: {
              locations: getListRequestCount() > 1 ? [] : [location],
            },
            isLoading: false,
            isUninitialized: false,
          }),
          infiniteScroll: (cb): (() => undefined) => {
            scrollCb = cb
            return () => undefined
          },
        }}
        navigateIf={{
          useNavigate: () => notUsed,
        }}
        searchLocationIf={{
          useSearch: () => ({
            search: notUsed,
            isLoading: false,
          }),
          create: createLocationIf,
        }}
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
  await waitFor(() => getByText(location.name))
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
