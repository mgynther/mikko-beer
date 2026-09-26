import { expect, test, vitest } from 'vitest'
import { render, waitFor } from '@testing-library/react'

import statsHook from '../../../src/storehooks/stats/stats'
import type {
  LocationStats,
  LocationStatsQueryParams,
} from '../../../src/storehooks/stats/types'
import { statsStore } from './stats-store'
import { statsValidators } from './stats-validators'
import { setupUser } from '../../user-event'
import { createErrorLogger } from '../../error-logger'
import { buildLocationStatsQueryParams } from './builders'

// Stubs for the store function and the validators, for the reason given in
// storehooks/brewery/get.test.tsx. The store functions a test does not drive
// are dontCall, so wiring the wrong one fails loudly.
const validatedStats: LocationStats = {
  location: [],
}

const queried = { location: [{ id: 'queried' }] }
const held = { location: [{ id: 'held' }] }

const params = buildLocationStatsQueryParams()

interface HelperProps {
  onQuery: (params: LocationStatsQueryParams) => void
  onQueried: (stats: LocationStats) => void
  onValidate: (result: unknown) => void
}

function Helper(props: HelperProps): React.JSX.Element {
  const store = statsStore({
    location: () => ({
      query: async (
        queryParams: LocationStatsQueryParams,
      ): Promise<unknown> => {
        props.onQuery(queryParams)
        return queried
      },
      data: held,
      isFetching: false,
    }),
  })
  const validators = statsValidators({
    location: (result: unknown) => {
      props.onValidate(result)
      return validatedStats
    },
    locationOrUndefined: (result: unknown) => {
      props.onValidate(result)
      return validatedStats
    },
  })
  const { query, stats, isLoading } = statsHook(
    store,
    validators,
  ).location.useStats()
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

test('location stats', async () => {
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
