import { act, render } from '@testing-library/react'
import { expect, test } from 'vitest'
import Beers from './Beers'
import type { SearchIf } from '../../core/search/types'
import LinkWrapper from '../LinkWrapper'
import type { UseDebounce } from '../../core/types'

const useDebounce: UseDebounce = str => str

const notUsed = (): any => { throw new Error('Do not call') }

const activeSearch: SearchIf = {
  useSearch: () => ({
    activate: notUsed,
    isActive: false
  }),
  useDebounce
}

const brewery = {
  id: '8e8f7718-f494-4787-b497-c6f1ad7a6e3c',
  name: 'Mad Hopper'
}

const breweries = [brewery]

const style = {
  id: '0866e685-1b0e-4c1a-8475-a3335ddedd8d',
  name: 'Imperial Stout',
  parents: []
}

const styles = [style]

const beer = {
  breweries,
  id: 'e3fad94c-2408-4f8f-8e3f-2b2c30ae6bfb',
  name: 'Parallax',
  styles
}

const anotherBeer = {
  breweries,
  id: 'b56107e2-9e92-4cbd-a0f1-bae25e44caa2',
  name: 'Blueberry Cheesecake',
  styles
}

const beers = [
  beer,
  anotherBeer
]

test('renders breweries', async () => {
  let scrollCb: (() => void) = () => undefined
  const { getByPlaceholderText, getAllByRole, getByRole } = render(
    <LinkWrapper>
      <Beers
        listBeersIf={{
          useList: () => ({
            list: async () => ({
              beers
            }),
            beerList: { beers },
            isLoading: false,
            isUninitialized: false
          }),
          infiniteScroll: (cb) => { scrollCb = cb; return () => undefined }
        }}
        navigateIf={{
          useNavigate: () => notUsed
        }}
        searchBeerIf={{
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
  getByRole('link', { name: beer.name })
  getByRole('link', { name: anotherBeer.name })
  getAllByRole('link', { name: brewery.name })
  getAllByRole('link', { name: style.name })
  getByRole('textbox')
  getByPlaceholderText('Search beer')
})
