import { test } from '../../test'
import { assertCalledWith, assertDefined } from '../../assert'
import { mockFunction } from '../../mock'
import { render } from '../../render'

import statsHook from '../../../src/storehooks/stats/stats'
import type {
  StyleStats,
  StyleStatsQueryParams,
} from '../../../src/storehooks/stats/types'
import { statsStore } from './stats-store'
import { statsValidators } from './stats-validators'
import { buildStyleStatsQueryParams } from './builders'

// Stubs for the store function and the validator, for the reason given in
// storehooks/brewery/get.test.tsx. The store functions a test does not drive
// are dontCall, so wiring the wrong one fails loudly.
const validatedStats: StyleStats = {
  style: [],
}

const data = { style: [{ styleId: 'one' }] }

const params = buildStyleStatsQueryParams()

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
  const onQuery = mockFunction<[params: StyleStatsQueryParams]>()
  const onValidate = mockFunction<[result: unknown]>()

  const { getByText } = render(
    <Helper onQuery={onQuery} onValidate={onValidate} />,
  )

  assertDefined(getByText('Validated stats'))
  assertDefined(getByText('Not loading'))
  assertCalledWith(onQuery, [params])
  assertCalledWith(onValidate, [data])
})
