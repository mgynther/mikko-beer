import { act, render } from '@testing-library/react'
import { expect, test } from 'vitest'
import Locations from './Locations'
import type { SearchIf } from '../../core/search/types'
import LinkWrapper from '../LinkWrapper'
import type { UseDebounce } from '../../core/types'
import type { CreateLocationIf } from '../../core/location/types'

const useDebounce: UseDebounce = str => str

const notUsed = (): any => { throw new Error('Do not call') }

const activeSearch: SearchIf = {
  useSearch: () => ({
    activate: notUsed,
    isActive: false
  }),
  useDebounce
}

const createLocationIf: CreateLocationIf = {
  useCreate: () => ({
    create: notUsed,
    isLoading: false
  })
}

const location = {
  id: 'e9d33373-596a-4a32-9878-098365b4fd62',
  name: 'Kahdet kasvot'
}

const anotherLocation = {
  id: 'c4c4f10c-0ce0-48b1-b366-e57d7fb3c9c9',
  name: 'Kultainen apina'
}

const locations = [
  location,
  anotherLocation
]

test('renders locations', async () => {
  let scrollCb: (() => void) = () => undefined
  const { getByPlaceholderText, getByRole } = render(
    <LinkWrapper>
      <Locations
        listLocationsIf={{
          useList: () => ({
            list: async () => ({
              locations
            }),
            locationList: { locations },
            isLoading: false,
            isUninitialized: false
          }),
          infiniteScroll: (cb) => { scrollCb = cb; return () => undefined }
        }}
        navigateIf={{
          useNavigate: () => notUsed
        }}
        searchLocationIf={{
          useSearch: () => ({
            search: notUsed,
            isLoading: false
          }),
          create: createLocationIf
        }}
        searchIf={activeSearch}
      />
    </LinkWrapper>
  )
  expect(scrollCb).not.toEqual(undefined)
  await act(async () => { scrollCb(); })
  getByRole('link', { name: location.name })
  getByRole('link', { name: anotherLocation.name })
  getByRole('textbox')
  getByPlaceholderText('Search location')
})
