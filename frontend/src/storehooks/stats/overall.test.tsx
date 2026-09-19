import { expect, test, vitest } from 'vitest'
import { render } from '@testing-library/react'

import statsHook from './stats'
import type { IdParams, OverallStats } from './types'
import { statsStore } from '../../../test-util/stats-store'
import { statsValidators } from '../../../test-util/stats-validators'

// Stubs for the store function and the validator, for the reason given in
// storehooks/brewery/get.test.tsx. The store functions a test does not drive
// are dontCall, so wiring the wrong one fails loudly.
const validatedStats: OverallStats = {
  beerCount: '482',
  breweryCount: '91',
  breweryCountryCount: '12',
  containerCount: '7',
  locationCount: '14',
  distinctBeerReviewCount: '401',
  reviewAverage: '8.25',
  reviewCount: '512',
  reviewMedian: '8.00',
  reviewMode: '8',
  reviewStandardDeviation: '0.86',
  reviewWithLocationCount: '198',
  reviewWithoutLocationCount: '314',
  styleCount: '33',
}

const data = { overall: { beerCount: '1' } }

const params: IdParams = {
  breweryId: undefined,
  locationId: undefined,
  styleId: undefined,
}

interface HelperProps {
  onQuery: (params: IdParams) => void
  onValidate: (result: unknown) => void
}

function Helper(props: HelperProps): React.JSX.Element {
  const store = statsStore({
    overall: (idParams: IdParams) => {
      props.onQuery(idParams)
      return { data, isLoading: false }
    },
  })
  const validators = statsValidators({
    overallOrUndefined: (result: unknown) => {
      props.onValidate(result)
      return validatedStats
    },
  })
  const { stats, isLoading } = statsHook(store, validators).overall.useStats(
    params,
  )
  return (
    <div>
      <div>{isLoading ? 'Loading' : 'Not loading'}</div>
      <div>{stats === undefined ? 'No stats' : stats.beerCount}</div>
    </div>
  )
}

test('overall stats', () => {
  const onQuery = vitest.fn()
  const onValidate = vitest.fn()

  const { getByText } = render(
    <Helper onQuery={onQuery} onValidate={onValidate} />,
  )

  expect(getByText(validatedStats.beerCount)).toBeDefined()
  expect(getByText('Not loading')).toBeDefined()
  expect(onQuery).toHaveBeenCalledWith(params)
  // The overall statistics arrive wrapped in an envelope, which is unwrapped
  // before the validator sees them.
  expect(onValidate).toHaveBeenCalledWith(data.overall)
})
