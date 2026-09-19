import { expect, test, vitest } from 'vitest'
import { render } from '@testing-library/react'

import getAnnualStorageStats from './annualStats'
import type {
  AnnualStats,
  UseGetStorageStats,
  ValidateAnnualStatsOrUndefined,
} from './types'

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
  const onValidate = vitest.fn()

  const { getByText } = render(<Helper onValidate={onValidate} />)

  const [one] = validatedStats.annual
  expect(getByText(`${one.year}: ${one.count}`)).toBeDefined()
  expect(getByText('Not loading')).toBeDefined()
  // The statistics are not wrapped in an envelope, so the validator is given
  // the response as it arrived.
  expect(onValidate).toHaveBeenCalledWith(stats)
})
