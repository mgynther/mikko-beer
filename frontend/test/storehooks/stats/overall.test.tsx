import { test } from '../../test'
import { assertCalledWith, assertDefined } from '../../assert'
import { mockFunction } from '../../mock'
import { render } from '../../render'

import statsHook from '../../../src/storehooks/stats/stats'
import type { IdParams } from '../../../src/storehooks/stats/types'
import { statsStore } from './stats-store'
import { statsValidators } from './stats-validators'
import { buildIdParams, buildOverallStats } from './builders'

// Stubs for the store function and the validator, for the reason given in
// storehooks/brewery/get.test.tsx. The store functions a test does not drive
// are dontCall, so wiring the wrong one fails loudly.
const validatedStats = buildOverallStats({ beerCount: '482' })

const data = { overall: { beerCount: '1' } }

const params = buildIdParams()

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
  const onQuery = mockFunction<[params: IdParams]>()
  const onValidate = mockFunction<[result: unknown]>()

  const { getByText } = render(
    <Helper onQuery={onQuery} onValidate={onValidate} />,
  )

  assertDefined(getByText(validatedStats.beerCount))
  assertDefined(getByText('Not loading'))
  assertCalledWith(onQuery, [params])
  // The overall statistics arrive wrapped in an envelope, which is unwrapped
  // before the validator sees them.
  assertCalledWith(onValidate, [data.overall])
})
