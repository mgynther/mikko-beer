import { expect, test, vitest } from 'vitest'
import { render, waitFor } from '@testing-library/react'

import statsHook from './stats'
import type {
  BreweryCountryStats,
  BreweryCountryStatsQueryParams,
} from './types'
import { statsStore } from '../../../test-util/stats-store'
import { statsValidators } from '../../../test-util/stats-validators'
import { setupUser } from '../../../test-util/user-event'
import { createErrorLogger } from '../../../test-util/error-logger'

// Stubs for the store function and the validators, for the reason given in
// storehooks/brewery/get.test.tsx. The store functions a test does not drive
// are dontCall, so wiring the wrong one fails loudly.
const validatedStats: BreweryCountryStats = {
  breweryCountry: [],
}

const queried = { breweryCountry: [{ id: 'queried' }] }
const held = { breweryCountry: [{ id: 'held' }] }

const params: BreweryCountryStatsQueryParams = {
  breweryId: undefined,
  locationId: undefined,
  styleId: undefined,
  pagination: { size: 10, skip: 0 },
  sorting: { order: 'average', direction: 'asc' },
  minReviewCount: 40,
  maxReviewCount: 80,
  minReviewAverage: 9,
  maxReviewAverage: 9.3,
  timeStart: 1,
  timeEnd: 2,
}

interface HelperProps {
  onQuery: (params: BreweryCountryStatsQueryParams) => void
  onQueried: (stats: BreweryCountryStats) => void
  onValidate: (result: unknown) => void
}

function Helper(props: HelperProps): React.JSX.Element {
  const store = statsStore({
    breweryCountry: () => ({
      query: async (
        queryParams: BreweryCountryStatsQueryParams,
      ): Promise<unknown> => {
        props.onQuery(queryParams)
        return queried
      },
      data: held,
      isFetching: false,
    }),
  })
  const validators = statsValidators({
    breweryCountry: (result: unknown) => {
      props.onValidate(result)
      return validatedStats
    },
    breweryCountryOrUndefined: (result: unknown) => {
      props.onValidate(result)
      return validatedStats
    },
  })
  const { query, stats, isLoading } = statsHook(
    store,
    validators,
  ).breweryCountry.useStats()
  return (
    <div>
      <div>{isLoading ? 'Loading' : 'Not loading'}</div>
      <div>{stats === undefined ? 'No stats' : 'Validated stats'}</div>
      <button
        type='button'
        onClick={() => {
          ;(async (): Promise<void> => {
            props.onQueried(await query(params))
          })().catch(createErrorLogger('query failed', console.error))
        }}
      >
        Query
      </button>
    </div>
  )
}

test('brewery-country stats', async () => {
  const user = setupUser()
  const onQuery = vitest.fn()
  const onQueried = vitest.fn()
  const onValidate = vitest.fn()

  const { getByRole, getByText } = render(
    <Helper onQuery={onQuery} onQueried={onQueried} onValidate={onValidate} />,
  )

  // What the store already holds is validated on the way out, and what a
  // query brings back is validated on its way through.
  expect(getByText('Validated stats')).toBeDefined()
  expect(getByText('Not loading')).toBeDefined()
  expect(onValidate).toHaveBeenCalledWith(held)

  await user.click(getByRole('button', { name: 'Query' }))
  await waitFor(() => {
    expect(onQueried).toHaveBeenCalledWith(validatedStats)
  })
  expect(onQuery).toHaveBeenCalledWith(params)
  expect(onValidate).toHaveBeenCalledWith(queried)
})
