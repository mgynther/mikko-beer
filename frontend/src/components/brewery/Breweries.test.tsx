import { act, render } from '@testing-library/react'
import { expect, test } from 'vitest'
import Breweries from './Breweries'
import type { SearchIf } from '../../core/search/types'
import LinkWrapper from '../LinkWrapper'

const useDebounce = (str: string) => str

const notUsed = () => { throw new Error('Do not call') }

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
  const { getByPlaceholderText, getByRole } = render(
    <LinkWrapper>
      <Breweries
        listBreweriesIf={{
          useList: () => ({
            list: async () => ({
              breweries
            }),
            breweryList: { breweries },
            isLoading: false,
            isUninitialized: false
          }),
          infiniteScroll: (cb) => { scrollCb = cb; return () => undefined }
        }}
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
  await act(async () => scrollCb())
  getByRole('link', { name: brewery.name })
  getByRole('link', { name: anotherBrewery.name })
  getByRole('textbox')
  getByPlaceholderText('Search brewery')
})
