import { test } from '../../test'
import { assertCalledWith, assertDefined } from '../../assert'
import { mockFunction } from '../../mock'
import { render } from '../../render'

import getMonthlyStorageStats from '../../../src/storehooks/storage/monthlyStats'
import type {
  MonthlyStats,
  UseGetStorageStats,
  ValidateMonthlyStatsOrUndefined,
} from '../../../src/storehooks/storage/types'

// Stubs for the store function and the validator, for the reason given in
// storehooks/brewery/get.test.tsx.
const validatedStats: MonthlyStats = {
  monthly: [{ year: '2001', month: '2', count: '11' }],
}

const stats = { monthly: [{ year: '2000', count: '1' }] }

function Helper(props: {
  onValidate: (result: unknown) => void
}): React.JSX.Element {
  const useStoreStats: UseGetStorageStats = () => ({
    data: stats,
    isLoading: false,
  })
  const validate: ValidateMonthlyStatsOrUndefined = (result: unknown) => {
    props.onValidate(result)
    return validatedStats
  }
  const { stats: validStats, isLoading } = getMonthlyStorageStats(
    useStoreStats,
    validate,
  ).useMonthlyStats()
  return (
    <div>
      <div>{isLoading ? 'Loading' : 'Not loading'}</div>
      {validStats?.monthly.map((one) => (
        <div key={one.year}>
          {one.year}: {one.count}
        </div>
      ))}
    </div>
  )
}

test('get monthly storage stats', () => {
  const onValidate = mockFunction<[result: unknown]>()

  const { getByText } = render(<Helper onValidate={onValidate} />)

  const [one] = validatedStats.monthly
  assertDefined(getByText(`${one.year}: ${one.count}`))
  assertDefined(getByText('Not loading'))
  // The statistics are not wrapped in an envelope, so the validator is given
  // the response as it arrived.
  assertCalledWith(onValidate, [stats])
})
