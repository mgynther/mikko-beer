import { test } from '../../test'
import { assertCalledWith, assertDefined } from '../../assert'
import { mockFunction } from '../../mock'
import { render } from '../../render'

import statsHook from '../../../src/storehooks/stats/stats'
import type { IdParams, AnnualStats } from '../../../src/storehooks/stats/types'
import { statsStore } from './stats-store'
import { statsValidators } from './stats-validators'
import { buildIdParams } from './builders'

// Stubs for the store function and the validator, for the reason given in
// storehooks/brewery/get.test.tsx. The store functions a test does not drive
// are dontCall, so wiring the wrong one fails loudly.
const validatedStats: AnnualStats = {
  annual: [],
}

const data = { annual: [{ id: 'one' }] }

const params = buildIdParams()

interface HelperProps {
  onQuery: (params: IdParams) => void
  onValidate: (result: unknown) => void
}

function Helper(props: HelperProps): React.JSX.Element {
  const store = statsStore({
    annual: (idParams: IdParams) => {
      props.onQuery(idParams)
      return { data, isLoading: false }
    },
  })
  const validators = statsValidators({
    annualOrUndefined: (result: unknown) => {
      props.onValidate(result)
      return validatedStats
    },
  })
  const { stats, isLoading } = statsHook(store, validators).annual.useStats(
    params,
  )
  return (
    <div>
      <div>{isLoading ? 'Loading' : 'Not loading'}</div>
      <div>{stats === undefined ? 'No stats' : 'Validated stats'}</div>
    </div>
  )
}

test('annual stats', () => {
  const onQuery = mockFunction()
  const onValidate = mockFunction()

  const { getByText } = render(
    <Helper onQuery={onQuery} onValidate={onValidate} />,
  )

  assertDefined(getByText('Validated stats'))
  assertDefined(getByText('Not loading'))
  assertCalledWith(onQuery, [params])
  // These statistics are not wrapped in an envelope, so the validator is
  // given the response as it arrived.
  assertCalledWith(onValidate, [data])
})
