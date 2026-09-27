import { test } from '../../test'
import { assertCalledWith, assertDefined } from '../../assert'
import { mockFunction } from '../../mock'
import { render } from '../../render'

import getAnnualStorageStats from '../../../src/storehooks/storage/annualStats'
import type {
  AnnualStats,
  UseGetStorageStats,
  ValidateAnnualStatsOrUndefined,
} from '../../../src/storehooks/storage/types'

// Stubs for the store function and the validator, for the reason given in
// storehooks/brewery/get.test.tsx.
const validatedStats: AnnualStats = {
  annual: [{ year: '2001', count: '11' }],
}

const stats = { annual: [{ year: '2000', count: '1' }] }

function Helper(props: {
  onValidate: (result: unknown) => void
}): React.JSX.Element {
  const useStoreStats: UseGetStorageStats = () => ({
    data: stats,
    isLoading: false,
  })
  const validate: ValidateAnnualStatsOrUndefined = (result: unknown) => {
    props.onValidate(result)
    return validatedStats
  }
  const { stats: validStats, isLoading } = getAnnualStorageStats(
    useStoreStats,
    validate,
  ).useAnnualStats()
  return (
    <div>
      <div>{isLoading ? 'Loading' : 'Not loading'}</div>
      {validStats?.annual.map((one) => (
        <div key={one.year}>
          {one.year}: {one.count}
        </div>
      ))}
    </div>
  )
}

test('get annual storage stats', () => {
  const onValidate = mockFunction<[result: unknown]>()

  const { getByText } = render(<Helper onValidate={onValidate} />)

  const [one] = validatedStats.annual
  assertDefined(getByText(`${one.year}: ${one.count}`))
  assertDefined(getByText('Not loading'))
  // The statistics are not wrapped in an envelope, so the validator is given
  // the response as it arrived.
  assertCalledWith(onValidate, [stats])
})
