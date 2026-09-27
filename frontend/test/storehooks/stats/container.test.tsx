import { test } from '../../test'
import { assertCalledWith, assertDefined } from '../../assert'
import { mockFunction } from '../../mock'
import { render } from '../../render'

import statsHook from '../../../src/storehooks/stats/stats'
import type {
  IdParams,
  ContainerStats,
} from '../../../src/storehooks/stats/types'
import { statsStore } from './stats-store'
import { statsValidators } from './stats-validators'
import { buildIdParams } from './builders'

// Stubs for the store function and the validator, for the reason given in
// storehooks/brewery/get.test.tsx. The store functions a test does not drive
// are dontCall, so wiring the wrong one fails loudly.
const validatedStats: ContainerStats = {
  container: [],
}

const data = { container: [{ id: 'one' }] }

const params = buildIdParams()

interface HelperProps {
  onQuery: (params: IdParams) => void
  onValidate: (result: unknown) => void
}

function Helper(props: HelperProps): React.JSX.Element {
  const store = statsStore({
    container: (idParams: IdParams) => {
      props.onQuery(idParams)
      return { data, isLoading: false }
    },
  })
  const validators = statsValidators({
    containerOrUndefined: (result: unknown) => {
      props.onValidate(result)
      return validatedStats
    },
  })
  const { stats, isLoading } = statsHook(store, validators).container.useStats(
    params,
  )
  return (
    <div>
      <div>{isLoading ? 'Loading' : 'Not loading'}</div>
      <div>{stats === undefined ? 'No stats' : 'Validated stats'}</div>
    </div>
  )
}

test('container stats', () => {
  const onQuery = mockFunction<[params: IdParams]>()
  const onValidate = mockFunction<[result: unknown]>()

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
