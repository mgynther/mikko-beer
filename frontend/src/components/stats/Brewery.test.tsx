import { act, fireEvent, render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, test, vitest } from 'vitest'
import Brewery from './Brewery'
import LinkWrapper from '../LinkWrapper'
import { openFilters } from './filters-test-util'

const dontCall = (): any => {
  throw new Error('must not be called')
}

const koskipanimo = {
  breweryId: 'ad11fad9-951a-473f-9c2e-88084589c4f7',
  breweryName: 'Koskipanimo',
  reviewAverage: '9.06',
  reviewCount: '63'
}

const lehe = {
  breweryId: '1d6505ea-9cbd-4215-bc5c-bd80b2a27af8',
  breweryName: 'Lehe pruulikoda',
  reviewAverage: '9.71',
  reviewCount: '24'
}

const unusedFilters = {
  minReviewCount: {
    value: 1,
    setValue: dontCall
  },
  maxReviewCount: {
    value: Infinity,
    setValue: dontCall
  },
  minReviewAverage: {
    value: 4.0,
    setValue: dontCall
  },
  maxReviewAverage: {
    value: 10.0,
    setValue: dontCall
  }
}

const breweryStats = { brewery: [{ ...koskipanimo }, { ...lehe }]}
const emptyStats = { brewery: []}

const usedStats = {
  useStats: () => ({
    query: async () => breweryStats,
    stats: emptyStats,
    isLoading: false
  }),
  infiniteScroll: (cb: () => void) => {
    cb()
    return () => undefined
  }
}

test('queries brewery stats', async () => {
  const query = vitest.fn()
  let loadCallback: () => void = () => undefined
  render(
    <LinkWrapper>
      <Brewery
        getBreweryStatsIf={{
          useStats: () => ({
            query: async (params) => {
              query(params)
              return {
                brewery: [
                  { ...koskipanimo },
                  { ...lehe }
                ]
              }
            },
            stats: {
              brewery: []
            },
            isLoading: false
          }),
          infiniteScroll: (cb) => {
            loadCallback = cb
            return () => undefined
          }
        }}
        breweryId={undefined}
        styleId={undefined}
      />
    </LinkWrapper>
  )
  expect(query.mock.calls).toEqual([])
  await act(async() => { loadCallback(); })
  expect(query.mock.calls).toEqual([[{
    breweryId: undefined,
    maxReviewAverage: unusedFilters.maxReviewAverage.value,
    maxReviewCount: unusedFilters.maxReviewCount.value,
    minReviewAverage: unusedFilters.minReviewAverage.value,
    minReviewCount: unusedFilters.minReviewCount.value,
    pagination: {
      size: 30,
      skip: 0
    },
    sorting: {
      direction: 'asc',
      order: 'brewery_name'
    },
    styleId: undefined
  }]])
})

test('renders brewery stats', async () => {
  const user = userEvent.setup()
  const { getByRole, getByText } = render(
    <LinkWrapper>
      <Brewery
        breweryId={'5e2f90e7-15f9-499d-baa3-c95f4282c509'}
        styleId={undefined}
        getBreweryStatsIf={usedStats}
      />
    </LinkWrapper>
  )
  // Need to do something to get breweries set.
  await openFilters(getByRole, user)
  getByText(koskipanimo.breweryName)
  getByText(koskipanimo.reviewAverage)
  getByText(koskipanimo.reviewCount)
  getByText(lehe.breweryName)
  getByText(lehe.reviewAverage)
  getByText(lehe.reviewCount)
})

test('sets minimum review count filter', async () => {
  const user = userEvent.setup()
  const { getByDisplayValue, getByRole } = render(
    <LinkWrapper>
      <Brewery
        breweryId={undefined}
        styleId={'32a7cffd-1b82-47cb-afea-c66f67663555'}
        getBreweryStatsIf={usedStats}
      />
    </LinkWrapper>
  )
  await openFilters(getByRole, user)
  const slider = getByDisplayValue('4')
  await act(async() => fireEvent.change(slider, {target: {value: '4.5'}}))
  getByDisplayValue('4.5')
})
