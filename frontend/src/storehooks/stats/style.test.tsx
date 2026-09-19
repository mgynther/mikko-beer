import { expect, test, vitest } from 'vitest'
import { render } from '@testing-library/react'

import statsHook from './stats'
import type { StyleStats, StyleStatsQueryParams } from './types'
import { statsStore } from '../../../test-util/stats-store'
import { statsValidators } from '../../../test-util/stats-validators'

// Stubs for the store function and the validator, for the reason given in
// storehooks/brewery/get.test.tsx. The store functions a test does not drive
// are dontCall, so wiring the wrong one fails loudly.
const validatedStats: StyleStats = {
  style: [],
}

const data = { style: [{ styleId: 'one' }] }

const params: StyleStatsQueryParams = {
  breweryId: undefined,
  locationId: undefined,
  styleId: undefined,
  sorting: { order: 'average', direction: 'asc' },
  minReviewCount: 40,
  maxReviewCount: 80,
  minReviewAverage: 9,
  maxReviewAverage: 9.3,
  timeStart: 1,
  timeEnd: 2,
}

interface HelperProps {
  onQuery: (params: StyleStatsQueryParams) => void
  onValidate: (result: unknown) => void
}

function Helper(props: HelperProps): React.JSX.Element {
  const store = statsStore({
    style: (queryParams: StyleStatsQueryParams) => {
      props.onQuery(queryParams)
      return { data, isLoading: false }
    },
  })
  const validators = statsValidators({
    styleOrUndefined: (result: unknown) => {
      props.onValidate(result)
      return validatedStats
    },
  })
  const { stats, isLoading } = statsHook(store, validators).style.useStats(
    params,
  )
  return (
    <div>
      <div>{isLoading ? 'Loading' : 'Not loading'}</div>
      <div>{stats === undefined ? 'No stats' : 'Validated stats'}</div>
    </div>
  )
}

test('style stats', () => {
  const onQuery = vitest.fn()
  const onValidate = vitest.fn()

  const { getByText } = render(
    <Helper onQuery={onQuery} onValidate={onValidate} />,
  )

  expect(getByText('Validated stats')).toBeDefined()
  expect(getByText('Not loading')).toBeDefined()
  expect(onQuery).toHaveBeenCalledWith(params)
  expect(onValidate).toHaveBeenCalledWith(data)
})
