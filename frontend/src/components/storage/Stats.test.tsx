import { render, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, test, vitest } from 'vitest'
import Stats from './Stats'
import type { UrlParamsIf } from '../util'
import type { StorageStatsIf } from '../../core/storage/types'

const dontCall = (): any => {
  throw new Error('must not be called')
}

const statsIf: StorageStatsIf = {
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
}

const emptyParamsIf: UrlParamsIf = {
  usePathParams: dontCall,
  useSearchParams: () => ({
    get: () => undefined,
  }),
}

function getStatsParamsIf(mode: string): UrlParamsIf {
  return {
    ...emptyParamsIf,
    useSearchParams: () => ({
      get: (key: string): string | undefined => {
        if (key === 'stats') {
          return mode
        }
        return undefined
      },
    }),
  }
}

const annualStatsParamsIf: UrlParamsIf = getStatsParamsIf('annual')

const monthlyStatsParamsIf: UrlParamsIf = getStatsParamsIf('monthly')

test('renders default annual storage stats on no search parameter', () => {
  const { getByText } = render(
    <Stats statsIf={statsIf} urlParamsIf={emptyParamsIf} />,
  )
  getByText('2021')
  getByText('8')
  getByText('2024')
  getByText('15')
})

test('renders default annual storage stats on unknown search parameter', () => {
  const { getByText } = render(
    <Stats statsIf={statsIf} urlParamsIf={getStatsParamsIf('unknown')} />,
  )
  getByText('2021')
  getByText('8')
  getByText('2024')
  getByText('15')
})

test('renders annual storage stats', () => {
  const { getByText } = render(
    <Stats statsIf={statsIf} urlParamsIf={annualStatsParamsIf} />,
  )
  getByText('2021')
  getByText('8')
  getByText('2024')
  getByText('15')
})

test('renders monthly storage stats', () => {
  const { getByText } = render(
    <Stats statsIf={statsIf} urlParamsIf={monthlyStatsParamsIf} />,
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
        ...statsIf,
        setSearch,
      }}
      urlParamsIf={monthlyStatsParamsIf}
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
        ...statsIf,
        setSearch,
      }}
      urlParamsIf={annualStatsParamsIf}
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
        ...statsIf,
        setSearch,
      }}
      urlParamsIf={annualStatsParamsIf}
    />,
  )
  const monthlyButton = getByRole('button', { name: 'Annual' })
  await user.click(monthlyButton)
  expect(setSearch).not.toHaveBeenCalled()
})
