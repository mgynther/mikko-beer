import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, test, vitest } from 'vitest'
import React from 'react'
import { testTimes } from '../../../test-util/filter-time'
import type { Props as HookProps } from './search-params'
import { parseSearchParams } from './search-params'
import type { SearchParameters, UseDebounce, YearMonth } from '../../core/types'
import type { ReviewSorting, ReviewSortingOrder } from '../../core/review/types'

const initialSorting: ReviewSorting = { order: 'time', direction: 'desc' }
const minTime: YearMonth = testTimes.min.yearMonth
const maxTime: YearMonth = testTimes.max.yearMonth

function makeSearchParams(
  record: Partial<Record<string, string>>,
): SearchParameters {
  return { get: (name: string) => record[name] }
}

// Immediate debounce: returns the final value synchronously, never pending.
const immediateDebounce = function <T>(): UseDebounce<T> {
  return (value: T) => [value, false]
}

// Constant pending debounce: used only for the isFilterChangePending test.
const pendingDebounce = function <T>(): UseDebounce<T> {
  return (value: T) => [value, true]
}

function defaultProps(overrides: Partial<HookProps> = {}): HookProps {
  return {
    initialSorting,
    searchParams: makeSearchParams({}),
    minTime,
    maxTime,
    getUseDebounce: immediateDebounce,
    setState: vitest.fn(),
    ...overrides,
  }
}

interface HarnessProps {
  hookProps: HookProps
  minRatingArg?: number
  maxRatingArg?: number
  minTimeArg?: YearMonth
  maxTimeArg?: YearMonth
  filtersOpenArg?: boolean
  orderArg?: ReviewSortingOrder
}

function Harness(props: HarnessProps): React.JSX.Element {
  const r = parseSearchParams(props.hookProps)
  return (
    <div>
      <span data-testid='pending'>{String(r.isFilterChangePending)}</span>
      <span data-testid='changeDetectionString'>{r.changeDetectionString}</span>
      <span data-testid='minTime'>{r.minTime}</span>
      <span data-testid='maxTime'>{r.maxTime}</span>
      <span data-testid='reviewListParams'>
        {JSON.stringify(r.reviewListParams)}
      </span>
      <span data-testid='filters'>{JSON.stringify(r.filters)}</span>
      <button
        onClick={() => r.filters.minRating.setValue(props.minRatingArg ?? 0)}
      >
        set min rating
      </button>
      <button
        onClick={() => r.filters.maxRating.setValue(props.maxRatingArg ?? 0)}
      >
        set max rating
      </button>
      <button
        onClick={() => r.filters.minTime.setValue(props.minTimeArg ?? minTime)}
      >
        set min time
      </button>
      <button
        onClick={() => r.filters.maxTime.setValue(props.maxTimeArg ?? maxTime)}
      >
        set max time
      </button>
      <button onClick={() => r.setIsFiltersOpen(props.filtersOpenArg ?? false)}>
        set filters open
      </button>
      <button onClick={() => r.changeSortingOrder(props.orderArg ?? 'time')}>
        change order
      </button>
    </div>
  )
}

const defaultRecord = {
  r_min_rating: '4',
  r_max_rating: '10',
  r_min_time: '2017-12',
  r_max_time: '2024-12',
  r_order: 'time',
  r_direction: 'desc',
  r_filters: '0',
}

// Group 1: Parsing -> reviewListParams (hook wires the parser correctly).

test('empty searchParams parse to defaults', () => {
  const { getByTestId } = render(<Harness hookProps={defaultProps()} />)
  const parsed = JSON.parse(getByTestId('reviewListParams').textContent ?? '')
  expect(parsed).toEqual({
    sortingOrder: 'time',
    sortingDirection: 'desc',
    minReviewRating: 4,
    maxReviewRating: 10,
    minTime,
    maxTime,
    isFiltersOpen: false,
  })
})

test('populated searchParams parse through', () => {
  const { getByTestId } = render(
    <Harness
      hookProps={defaultProps({
        searchParams: makeSearchParams({
          r_order: 'rating',
          r_direction: 'asc',
          r_min_rating: '6',
          r_max_rating: '9',
          r_min_time: '2019-03',
          r_max_time: '2022-08',
          r_filters: '1',
        }),
      })}
    />,
  )
  const parsed = JSON.parse(getByTestId('reviewListParams').textContent ?? '')
  expect(parsed).toEqual({
    sortingOrder: 'rating',
    sortingDirection: 'asc',
    minReviewRating: 6,
    maxReviewRating: 9,
    minTime: { year: 2019, month: 3 },
    maxTime: { year: 2022, month: 8 },
    isFiltersOpen: true,
  })
})

test('invalid searchParams fall back to defaults', () => {
  const { getByTestId } = render(
    <Harness
      hookProps={defaultProps({
        searchParams: makeSearchParams({
          r_order: 'bogus',
          r_direction: 'sideways',
          r_min_time: 'nope',
          r_max_time: 'also-bad-x',
          r_filters: '2',
        }),
      })}
    />,
  )
  const parsed = JSON.parse(getByTestId('reviewListParams').textContent ?? '')
  expect(parsed).toEqual({
    sortingOrder: 'time',
    sortingDirection: 'desc',
    minReviewRating: 4,
    maxReviewRating: 10,
    minTime,
    maxTime,
    isFiltersOpen: false,
  })
})

// Group 2: filters object shape.

test('filters expose parsed values and props bounds', () => {
  const { getByTestId } = render(
    <Harness
      hookProps={defaultProps({
        searchParams: makeSearchParams({
          r_min_rating: '6',
          r_max_rating: '9',
          r_min_time: '2019-03',
          r_max_time: '2022-08',
        }),
      })}
    />,
  )
  const filters = JSON.parse(getByTestId('filters').textContent ?? '')
  expect(filters).toEqual({
    minRating: { value: 6 },
    maxRating: { value: 9 },
    minTime: {
      min: minTime,
      max: maxTime,
      value: { year: 2019, month: 3 },
    },
    maxTime: {
      min: minTime,
      max: maxTime,
      value: { year: 2022, month: 8 },
    },
  })
})

// Group 3: timestamp outputs.

test('minTime and maxTime are numeric timestamps', () => {
  const { getByTestId } = render(<Harness hookProps={defaultProps()} />)
  expect(getByTestId('minTime').textContent).toEqual(
    `${testTimes.min.utcTimestamp}`,
  )
  expect(getByTestId('maxTime').textContent).toEqual(
    `${testTimes.max.utcTimestamp}`,
  )
})

// Group 4: mount effect ("initial setter for reload").

test('mount commits formatToSearch once for empty defaults', () => {
  const setState = vitest.fn()
  render(<Harness hookProps={defaultProps({ setState })} />)
  expect(setState.mock.calls).toEqual([[defaultRecord]])
})

test('mount commits formatToSearch once for populated params', () => {
  const setState = vitest.fn()
  render(
    <Harness
      hookProps={defaultProps({
        setState,
        searchParams: makeSearchParams({
          r_order: 'rating',
          r_direction: 'asc',
          r_min_rating: '6',
          r_max_rating: '9',
          r_min_time: '2019-03',
          r_max_time: '2022-08',
          r_filters: '1',
        }),
      })}
    />,
  )
  expect(setState.mock.calls).toEqual([
    [
      {
        r_min_rating: '6',
        r_max_rating: '9',
        r_min_time: '2019-03',
        r_max_time: '2022-08',
        r_order: 'rating',
        r_direction: 'asc',
        r_filters: '1',
      },
    ],
  ])
})

// Group 5: value setters -> immediate debounce -> setState (pipeline).

test('min rating setter commits rounded value', async () => {
  const user = userEvent.setup()
  const setState = vitest.fn()
  const { getByRole } = render(
    <Harness hookProps={defaultProps({ setState })} minRatingArg={7} />,
  )
  setState.mockClear()
  await user.click(getByRole('button', { name: 'set min rating' }))
  expect(setState.mock.calls).toEqual([
    [{ ...defaultRecord, r_min_rating: '7' }],
  ])
})

test('max rating setter commits value', async () => {
  const user = userEvent.setup()
  const setState = vitest.fn()
  const { getByRole } = render(
    <Harness hookProps={defaultProps({ setState })} maxRatingArg={9} />,
  )
  setState.mockClear()
  await user.click(getByRole('button', { name: 'set max rating' }))
  expect(setState.mock.calls).toEqual([
    [{ ...defaultRecord, r_max_rating: '9' }],
  ])
})

test('rating setter rounds to nearest integer string', async () => {
  const user = userEvent.setup()
  const setState = vitest.fn()
  const { getByRole } = render(
    <Harness hookProps={defaultProps({ setState })} minRatingArg={7.6} />,
  )
  setState.mockClear()
  await user.click(getByRole('button', { name: 'set min rating' }))
  expect(setState.mock.calls).toEqual([
    [{ ...defaultRecord, r_min_rating: '8' }],
  ])
})

test('min time setter commits formatted year-month', async () => {
  const user = userEvent.setup()
  const setState = vitest.fn()
  const { getByRole } = render(
    <Harness
      hookProps={defaultProps({ setState })}
      minTimeArg={{ year: 2020, month: 4 }}
    />,
  )
  setState.mockClear()
  await user.click(getByRole('button', { name: 'set min time' }))
  expect(setState.mock.calls).toEqual([
    [{ ...defaultRecord, r_min_time: '2020-04' }],
  ])
})

test('max time setter commits formatted year-month', async () => {
  const user = userEvent.setup()
  const setState = vitest.fn()
  const { getByRole } = render(
    <Harness
      hookProps={defaultProps({ setState })}
      maxTimeArg={{ year: 2021, month: 11 }}
    />,
  )
  setState.mockClear()
  await user.click(getByRole('button', { name: 'set max time' }))
  expect(setState.mock.calls).toEqual([
    [{ ...defaultRecord, r_max_time: '2021-11' }],
  ])
})

test('setters rebuild from committed state, keeping other keys', async () => {
  const user = userEvent.setup()
  const setState = vitest.fn()
  const populated = {
    r_min_rating: '5',
    r_max_rating: '9',
    r_min_time: '2019-03',
    r_max_time: '2022-08',
    r_order: 'rating',
    r_direction: 'asc',
    r_filters: '1',
  }
  const { getByRole } = render(
    <Harness
      hookProps={defaultProps({
        setState,
        searchParams: makeSearchParams(populated),
      })}
      minRatingArg={7}
    />,
  )
  setState.mockClear()
  await user.click(getByRole('button', { name: 'set min rating' }))
  expect(setState.mock.calls).toEqual([[{ ...populated, r_min_rating: '7' }]])
})

// Group 6: isFilterChangePending.

test('pending flag plumbs through from debounce tuple', () => {
  const pending = render(
    <Harness hookProps={defaultProps({ getUseDebounce: pendingDebounce })} />,
  )
  expect(pending.getByTestId('pending').textContent).toEqual('true')
  pending.unmount()

  const settled = render(<Harness hookProps={defaultProps()} />)
  expect(settled.getByTestId('pending').textContent).toEqual('false')
})

// Group 7: setIsFiltersOpen (direct, no debounce).

test('setIsFiltersOpen true commits synchronously', async () => {
  const user = userEvent.setup()
  const setState = vitest.fn()
  const { getByRole } = render(
    <Harness hookProps={defaultProps({ setState })} filtersOpenArg={true} />,
  )
  setState.mockClear()
  await user.click(getByRole('button', { name: 'set filters open' }))
  expect(setState.mock.calls).toEqual([[{ ...defaultRecord, r_filters: '1' }]])
})

test('setIsFiltersOpen false commits synchronously', async () => {
  const user = userEvent.setup()
  const setState = vitest.fn()
  const { getByRole } = render(
    <Harness
      hookProps={defaultProps({
        setState,
        searchParams: makeSearchParams({ r_filters: '1' }),
      })}
      filtersOpenArg={false}
    />,
  )
  setState.mockClear()
  await user.click(getByRole('button', { name: 'set filters open' }))
  expect(setState.mock.calls).toEqual([[{ ...defaultRecord, r_filters: '0' }]])
})

// Group 8: changeSortingOrder.

test('changeSortingOrder toggles direction for same order asc', async () => {
  const user = userEvent.setup()
  const setState = vitest.fn()
  const { getByRole } = render(
    <Harness
      hookProps={defaultProps({
        setState,
        searchParams: makeSearchParams({
          r_order: 'rating',
          r_direction: 'asc',
        }),
      })}
      orderArg={'rating'}
    />,
  )
  setState.mockClear()
  await user.click(getByRole('button', { name: 'change order' }))
  expect(setState.mock.calls).toEqual([
    [{ ...defaultRecord, r_order: 'rating', r_direction: 'desc' }],
  ])
})

test('changeSortingOrder toggles direction for same order desc', async () => {
  const user = userEvent.setup()
  const setState = vitest.fn()
  const { getByRole } = render(
    <Harness
      hookProps={defaultProps({
        setState,
        searchParams: makeSearchParams({
          r_order: 'rating',
          r_direction: 'desc',
        }),
      })}
      orderArg={'rating'}
    />,
  )
  setState.mockClear()
  await user.click(getByRole('button', { name: 'change order' }))
  expect(setState.mock.calls).toEqual([
    [{ ...defaultRecord, r_order: 'rating', r_direction: 'asc' }],
  ])
})

test('changeSortingOrder to beer_name sets ascending', async () => {
  const user = userEvent.setup()
  const setState = vitest.fn()
  const { getByRole } = render(
    <Harness hookProps={defaultProps({ setState })} orderArg={'beer_name'} />,
  )
  setState.mockClear()
  await user.click(getByRole('button', { name: 'change order' }))
  expect(setState.mock.calls).toEqual([
    [{ ...defaultRecord, r_order: 'beer_name', r_direction: 'asc' }],
  ])
})

test('changeSortingOrder to non-beer_name sets descending', async () => {
  const user = userEvent.setup()
  const setState = vitest.fn()
  const { getByRole } = render(
    <Harness hookProps={defaultProps({ setState })} orderArg={'rating'} />,
  )
  setState.mockClear()
  await user.click(getByRole('button', { name: 'change order' }))
  expect(setState.mock.calls).toEqual([
    [{ ...defaultRecord, r_order: 'rating', r_direction: 'desc' }],
  ])
})

// Group 9: changeDetectionString (opaque change-detection key).

test('changeDetectionString is stable for equal inputs', () => {
  const { getByTestId, rerender } = render(
    <Harness hookProps={defaultProps()} />,
  )
  const first = getByTestId('changeDetectionString').textContent
  rerender(<Harness hookProps={defaultProps()} />)
  expect(getByTestId('changeDetectionString').textContent).toEqual(first)
})

test('changeDetectionString differs when sorting order changes', () => {
  const { getByTestId, rerender } = render(
    <Harness hookProps={defaultProps()} />,
  )
  const first = getByTestId('changeDetectionString').textContent
  rerender(
    <Harness
      hookProps={defaultProps({
        searchParams: makeSearchParams({ r_order: 'rating' }),
      })}
    />,
  )
  expect(getByTestId('changeDetectionString').textContent).not.toEqual(first)
})

test('changeDetectionString differs when a filter value changes', () => {
  const { getByTestId, rerender } = render(
    <Harness hookProps={defaultProps()} />,
  )
  const first = getByTestId('changeDetectionString').textContent
  rerender(
    <Harness
      hookProps={defaultProps({
        searchParams: makeSearchParams({ r_min_rating: '7' }),
      })}
    />,
  )
  expect(getByTestId('changeDetectionString').textContent).not.toEqual(first)
})
