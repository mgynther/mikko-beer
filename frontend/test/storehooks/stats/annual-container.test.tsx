import { test } from '../../test'
import { assertCalledWith, assertDefined } from '../../assert'
import { mockFunction } from '../../mock'
import { render, waitFor } from '../../render'

import statsHook from '../../../src/storehooks/stats/stats'
import type {
  AnnualContainerStats,
  AnnualContainerStatsQueryParams,
} from '../../../src/storehooks/stats/types'
import { statsStore } from './stats-store'
import { statsValidators } from './stats-validators'
import { setupUser } from '../../user-event'
import { createErrorLogger } from '../../error-logger'
import { buildAnnualContainerStatsQueryParams } from './builders'

// Stubs for the store function and the validators, for the reason given in
// storehooks/brewery/get.test.tsx. The store functions a test does not drive
// are dontCall, so wiring the wrong one fails loudly.
const validatedStats: AnnualContainerStats = {
  annualContainer: [],
}

const queried = { annualContainer: [{ id: 'queried' }] }
const held = { annualContainer: [{ id: 'held' }] }

const params = buildAnnualContainerStatsQueryParams()

interface HelperProps {
  onQuery: (params: AnnualContainerStatsQueryParams) => void
  onQueried: (stats: AnnualContainerStats) => void
  onValidate: (result: unknown) => void
}

function Helper(props: HelperProps): React.JSX.Element {
  const store = statsStore({
    annualContainer: () => ({
      query: async (
        queryParams: AnnualContainerStatsQueryParams,
      ): Promise<unknown> => {
        props.onQuery(queryParams)
        return queried
      },
      data: held,
      isFetching: false,
    }),
  })
  const validators = statsValidators({
    annualContainer: (result: unknown) => {
      props.onValidate(result)
      return validatedStats
    },
    annualContainerOrUndefined: (result: unknown) => {
      props.onValidate(result)
      return validatedStats
    },
  })
  const { query, stats, isLoading } = statsHook(
    store,
    validators,
  ).annualContainer.useStats()
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

test('annual-container stats', async () => {
  const user = setupUser()
  const onQuery = mockFunction()
  const onQueried = mockFunction()
  const onValidate = mockFunction()

  const { getByRole, getByText } = render(
    <Helper onQuery={onQuery} onQueried={onQueried} onValidate={onValidate} />,
  )

  // What the store already holds is validated on the way out, and what a
  // query brings back is validated on its way through.
  assertDefined(getByText('Validated stats'))
  assertDefined(getByText('Not loading'))
  assertCalledWith(onValidate, [held])

  await user.click(getByRole('button', { name: 'Query' }))
  await waitFor(() => {
    assertCalledWith(onQueried, [validatedStats])
  })
  assertCalledWith(onQuery, [params])
  assertCalledWith(onValidate, [queried])
})
