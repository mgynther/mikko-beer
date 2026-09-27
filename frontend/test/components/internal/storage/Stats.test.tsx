import { test } from '../../../test'
import { assertCallCount, assertCalledWith } from '../../../assert'
import { mockFunction } from '../../../mock'
import { render, waitFor } from '../../../render'
import { setupUser } from '../../../user-event'
import Stats from '../../../../src/components/internal/storage/Stats'
import type { StorageStatsIf } from '../../../../src/components/types/storage/types'
import type { UseUrlSearchParams } from '../../../../src/components/types/types'
import { dontCall } from '../../../dont-call'

const useEmptyUrlSearchParams: UseUrlSearchParams = () => ({
  get: () => undefined,
})

const getStatsIf: (useUrlSearchParams: UseUrlSearchParams) => StorageStatsIf = (
  useUrlSearchParams,
) => ({
  annual: {
    useAnnualStats: () => ({
      stats: {
        annual: [
          { year: '2021', count: '8' },
          { year: '2024', count: '15' },
        ],
      },
      isLoading: false,
    }),
  },
  monthly: {
    useMonthlyStats: () => ({
      stats: {
        monthly: [
          { year: '2021', month: '4', count: '8' },
          { year: '2024', month: '10', count: '15' },
        ],
      },
      isLoading: false,
    }),
  },
  setSearch: dontCall,
  useUrlSearchParams: useUrlSearchParams,
})

function getStatsUrlParams(mode: string): UseUrlSearchParams {
  return () => ({
    get: (key: string): string | undefined => {
      if (key === 'stats') {
        return mode
      }
      return undefined
    },
  })
}

const annualStatsUrlParams = getStatsUrlParams('annual')

const monthlyStatsUrlParams = getStatsUrlParams('monthly')

test('renders default annual storage stats on no search parameter', () => {
  const { getByText } = render(
    <Stats statsIf={getStatsIf(useEmptyUrlSearchParams)} />,
  )
  getByText('2021')
  getByText('8')
  getByText('2024')
  getByText('15')
})

test('renders default annual storage stats on unknown search parameter', () => {
  const { getByText } = render(
    <Stats statsIf={getStatsIf(getStatsUrlParams('unknown'))} />,
  )
  getByText('2021')
  getByText('8')
  getByText('2024')
  getByText('15')
})

test('renders annual storage stats', () => {
  const { getByText } = render(
    <Stats statsIf={getStatsIf(annualStatsUrlParams)} />,
  )
  getByText('2021')
  getByText('8')
  getByText('2024')
  getByText('15')
})

test('renders monthly storage stats', () => {
  const { getByText } = render(
    <Stats statsIf={getStatsIf(monthlyStatsUrlParams)} />,
  )
  getByText('2021-04')
  getByText('8')
  getByText('2024-10')
  getByText('15')
})

test('switch to annual storage stats', async () => {
  const user = setupUser()
  const setSearch = mockFunction()
  const { getByRole } = render(
    <Stats
      statsIf={{
        ...getStatsIf(monthlyStatsUrlParams),
        setSearch,
      }}
    />,
  )
  const monthlyButton = getByRole('button', { name: 'Annual' })
  await user.click(monthlyButton)
  await waitFor(() => {
    assertCalledWith(setSearch, ['annual', {}])
  })
  assertCallCount(setSearch, 1)
})

test('switch to monthly storage stats', async () => {
  const user = setupUser()
  const setSearch = mockFunction()
  const { getByRole } = render(
    <Stats
      statsIf={{
        ...getStatsIf(annualStatsUrlParams),
        setSearch,
      }}
    />,
  )
  const monthlyButton = getByRole('button', { name: 'Monthly' })
  await user.click(monthlyButton)
  await waitFor(() => {
    assertCalledWith(setSearch, ['monthly', {}])
  })
  assertCallCount(setSearch, 1)
})

test('ignore selecting current storage stats mode', async () => {
  const user = setupUser()
  const setSearch = mockFunction()
  const { getByRole } = render(
    <Stats
      statsIf={{
        ...getStatsIf(annualStatsUrlParams),
        setSearch,
      }}
    />,
  )
  const monthlyButton = getByRole('button', { name: 'Annual' })
  await user.click(monthlyButton)
  assertCallCount(setSearch, 0)
})
