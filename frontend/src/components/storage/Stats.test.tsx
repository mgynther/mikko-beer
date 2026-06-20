import { render, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, test, vitest } from 'vitest'
import Stats from './Stats'
import type { StorageStatsIf } from '../../core/storage/types'
import type { UseUrlSearchParams } from '../../core/types'
import { dontCall } from '../../../test-util/dont-call'

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
  const user = userEvent.setup()
  const setSearch = vitest.fn()
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
    expect(setSearch).toHaveBeenCalledWith('annual', {})
  })
  expect(setSearch).toHaveBeenCalledTimes(1)
})

test('switch to monthly storage stats', async () => {
  const user = userEvent.setup()
  const setSearch = vitest.fn()
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
    expect(setSearch).toHaveBeenCalledWith('monthly', {})
  })
  expect(setSearch).toHaveBeenCalledTimes(1)
})

test('ignore selecting current storage stats mode', async () => {
  const user = userEvent.setup()
  const setSearch = vitest.fn()
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
  expect(setSearch).not.toHaveBeenCalled()
})
