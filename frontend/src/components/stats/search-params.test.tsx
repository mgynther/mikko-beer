import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, test, vitest } from 'vitest'
import React from 'react'
import { testTimes } from '../../../test-util/filter-time'
import type { Props as HookProps } from './search-params'
import { searchParams } from './search-params'
import type { SearchParameters, UseDebounce, YearMonth } from '../../core/types'

type SortingOrder = 'text' | 'count' | 'average' | 'std_dev'

const nameProperty = 'text'
const minTime: YearMonth = testTimes.min.yearMonth
const maxTime: YearMonth = testTimes.max.yearMonth

function sortingOrderParser(
  search: SearchParameters | undefined,
): SortingOrder {
  const value = search?.get('s_order')
  if (
    value === 'text' ||
    value === 'count' ||
    value === 'average' ||
    value === 'std_dev'
  ) {
    return value
  }
  return 'text'
}

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

function defaultProps(
  overrides: Partial<HookProps<SortingOrder>> = {},
): HookProps<SortingOrder> {
  return {
    nameProperty,
    search: makeSearchParams({}),
    minTime,
    maxTime,
    getUseDebounce: immediateDebounce,
    sortingOrderParser,
    setState: vitest.fn(),
    ...overrides,
  }
}

interface HarnessProps {
  hookProps: HookProps<SortingOrder>
  minCountArg?: number
  maxCountArg?: number
  minAvgArg?: number
  maxAvgArg?: number
  timeStartArg?: YearMonth
  timeEndArg?: YearMonth
  filtersOpenArg?: boolean
  orderArg?: SortingOrder
}

function Harness(props: HarnessProps): React.JSX.Element {
  const r = searchParams<SortingOrder>(props.hookProps)
  const f = r.filters
  return (
    <div>
      <span data-testid='pending'>{String(r.isFilterChangePending)}</span>
      <span data-testid='changeDetectionString'>{r.changeDetectionString}</span>

      <span data-testid='sortingOrder'>{r.statsParams.sortingOrder}</span>
      <span data-testid='sortingDirection'>
        {r.statsParams.sortingDirection}
      </span>
      <span data-testid='minReviewCount'>
        {String(r.statsParams.minReviewCount)}
      </span>
      <span data-testid='maxReviewCount'>
        {String(r.statsParams.maxReviewCount)}
      </span>
      <span data-testid='minReviewAverage'>
        {String(r.statsParams.minReviewAverage)}
      </span>
      <span data-testid='maxReviewAverage'>
        {String(r.statsParams.maxReviewAverage)}
      </span>
      <span data-testid='timeStart'>{String(r.statsParams.timeStart)}</span>
      <span data-testid='timeEnd'>{String(r.statsParams.timeEnd)}</span>
      <span data-testid='isFiltersOpen'>
        {String(r.statsParams.isFiltersOpen)}
      </span>

      <span data-testid='f_minCount'>{String(f.minReviewCount.value)}</span>
      <span data-testid='f_maxCount'>{String(f.maxReviewCount.value)}</span>
      <span data-testid='f_minAvg'>{String(f.minReviewAverage.value)}</span>
      <span data-testid='f_maxAvg'>{String(f.maxReviewAverage.value)}</span>
      <span data-testid='f_timeStart'>{JSON.stringify(f.timeStart)}</span>
      <span data-testid='f_timeEnd'>{JSON.stringify(f.timeEnd)}</span>

      <button onClick={() => f.minReviewCount.setValue(props.minCountArg ?? 0)}>
        set min count
      </button>
      <button onClick={() => f.maxReviewCount.setValue(props.maxCountArg ?? 0)}>
        set max count
      </button>
      <button onClick={() => f.minReviewAverage.setValue(props.minAvgArg ?? 0)}>
        set min average
      </button>
      <button onClick={() => f.maxReviewAverage.setValue(props.maxAvgArg ?? 0)}>
        set max average
      </button>
      <button
        onClick={() => f.timeStart.setValue(props.timeStartArg ?? minTime)}
      >
        set time start
      </button>
      <button onClick={() => f.timeEnd.setValue(props.timeEndArg ?? maxTime)}>
        set time end
      </button>
      <button onClick={() => r.setIsFiltersOpen(props.filtersOpenArg ?? false)}>
        set filters open
      </button>
      <button onClick={() => r.changeSortingOrder(props.orderArg ?? 'text')}>
        change order
      </button>
    </div>
  )
}

const defaultRecord = {
  s_min_count: '1',
  s_max_count: 'Infinity',
  s_min_avg: '4.00',
  s_max_avg: '10.00',
  s_time_start: '2017-12',
  s_time_end: '2024-12',
  s_order: 'text',
  s_direction: 'asc',
  s_filters: '0',
}

// Group 1: Parsing -> statsParams (hook wires the parser correctly).

test('empty search parses to defaults', () => {
  const { getByTestId } = render(<Harness hookProps={defaultProps()} />)
  expect(getByTestId('sortingOrder').textContent).toEqual('text')
  expect(getByTestId('sortingDirection').textContent).toEqual('asc')
  expect(getByTestId('minReviewCount').textContent).toEqual('1')
  expect(getByTestId('maxReviewCount').textContent).toEqual('Infinity')
  expect(getByTestId('minReviewAverage').textContent).toEqual('4')
  expect(getByTestId('maxReviewAverage').textContent).toEqual('10')
  expect(getByTestId('timeStart').textContent).toEqual(
    `${testTimes.min.utcTimestamp}`,
  )
  expect(getByTestId('timeEnd').textContent).toEqual(
    `${testTimes.max.utcTimestamp}`,
  )
  expect(getByTestId('isFiltersOpen').textContent).toEqual('false')
})

test('populated search parses through', () => {
  const { getByTestId } = render(
    <Harness
      hookProps={defaultProps({
        search: makeSearchParams({
          s_order: 'count',
          s_direction: 'desc',
          s_min_count: '3',
          s_max_count: '99',
          s_min_avg: '6.50',
          s_max_avg: '9.25',
          s_time_start: '2019-03',
          s_time_end: '2022-08',
          s_filters: '1',
        }),
      })}
    />,
  )
  expect(getByTestId('sortingOrder').textContent).toEqual('count')
  expect(getByTestId('sortingDirection').textContent).toEqual('desc')
  expect(getByTestId('minReviewCount').textContent).toEqual('3')
  expect(getByTestId('maxReviewCount').textContent).toEqual('99')
  expect(getByTestId('minReviewAverage').textContent).toEqual('6.5')
  expect(getByTestId('maxReviewAverage').textContent).toEqual('9.25')
  expect(getByTestId('timeStart').textContent).toEqual(
    `${new Date(2019, 2, 1).getTime()}`,
  )
  expect(getByTestId('timeEnd').textContent).toEqual(
    `${new Date(2022, 8, 0, 23, 59, 59).getTime()}`,
  )
  expect(getByTestId('isFiltersOpen').textContent).toEqual('true')
})

test('invalid search values fall back to defaults', () => {
  const { getByTestId } = render(
    <Harness
      hookProps={defaultProps({
        search: makeSearchParams({
          s_order: 'bogus',
          s_direction: 'sideways',
          s_time_start: 'nope',
          s_time_end: 'also-bad-x',
          s_filters: '2',
        }),
      })}
    />,
  )
  expect(getByTestId('sortingOrder').textContent).toEqual('text')
  expect(getByTestId('sortingDirection').textContent).toEqual('asc')
  expect(getByTestId('timeStart').textContent).toEqual(
    `${testTimes.min.utcTimestamp}`,
  )
  expect(getByTestId('timeEnd').textContent).toEqual(
    `${testTimes.max.utcTimestamp}`,
  )
  expect(getByTestId('isFiltersOpen').textContent).toEqual('false')
})

// Group 2: filters object shape.

test('filters expose parsed numeric values', () => {
  const { getByTestId } = render(
    <Harness
      hookProps={defaultProps({
        search: makeSearchParams({
          s_min_count: '3',
          s_max_count: '99',
          s_min_avg: '6.50',
          s_max_avg: '9.25',
        }),
      })}
    />,
  )
  expect(getByTestId('f_minCount').textContent).toEqual('3')
  expect(getByTestId('f_maxCount').textContent).toEqual('99')
  expect(getByTestId('f_minAvg').textContent).toEqual('6.5')
  expect(getByTestId('f_maxAvg').textContent).toEqual('9.25')
})

test('filters max count exposes Infinity default, not null', () => {
  const { getByTestId } = render(<Harness hookProps={defaultProps()} />)
  expect(getByTestId('f_maxCount').textContent).toEqual('Infinity')
})

test('filters time values are year-months with props bounds', () => {
  const { getByTestId } = render(
    <Harness
      hookProps={defaultProps({
        search: makeSearchParams({
          s_time_start: '2019-03',
          s_time_end: '2022-08',
        }),
      })}
    />,
  )
  const timeStart = JSON.parse(getByTestId('f_timeStart').textContent ?? '')
  const timeEnd = JSON.parse(getByTestId('f_timeEnd').textContent ?? '')
  expect(timeStart).toEqual({
    min: minTime,
    max: maxTime,
    value: { year: 2019, month: 3 },
  })
  expect(timeEnd).toEqual({
    min: minTime,
    max: maxTime,
    value: { year: 2022, month: 8 },
  })
  // The filter value is a YearMonth, while statsParams exposes a timestamp.
  expect(getByTestId('timeStart').textContent).toEqual(
    `${new Date(2019, 2, 1).getTime()}`,
  )
  expect(getByTestId('timeEnd').textContent).toEqual(
    `${new Date(2022, 8, 0, 23, 59, 59).getTime()}`,
  )
})

// Group 3: timestamp outputs.

test('statsParams time start and end are numeric timestamps', () => {
  const { getByTestId } = render(<Harness hookProps={defaultProps()} />)
  expect(getByTestId('timeStart').textContent).toEqual(
    `${testTimes.min.utcTimestamp}`,
  )
  expect(getByTestId('timeEnd').textContent).toEqual(
    `${testTimes.max.utcTimestamp}`,
  )
})

// Group 4: mount effect ("initial setter for reload").

test('mount commits formatToSearch once for empty defaults', () => {
  const setState = vitest.fn()
  render(<Harness hookProps={defaultProps({ setState })} />)
  expect(setState.mock.calls).toEqual([[defaultRecord]])
})

test('mount commits formatToSearch once for populated search', () => {
  const setState = vitest.fn()
  render(
    <Harness
      hookProps={defaultProps({
        setState,
        search: makeSearchParams({
          s_order: 'count',
          s_direction: 'desc',
          s_min_count: '3',
          s_max_count: '99',
          s_min_avg: '6.50',
          s_max_avg: '9.25',
          s_time_start: '2019-03',
          s_time_end: '2022-08',
          s_filters: '1',
        }),
      })}
    />,
  )
  expect(setState.mock.calls).toEqual([
    [
      {
        s_min_count: '3',
        s_max_count: '99',
        s_min_avg: '6.50',
        s_max_avg: '9.25',
        s_time_start: '2019-03',
        s_time_end: '2022-08',
        s_order: 'count',
        s_direction: 'desc',
        s_filters: '1',
      },
    ],
  ])
})

// Group 5: value setters -> immediate debounce -> setState (pipeline).

test('min count setter commits value', async () => {
  const user = userEvent.setup()
  const setState = vitest.fn()
  const { getByRole } = render(
    <Harness hookProps={defaultProps({ setState })} minCountArg={7} />,
  )
  setState.mockClear()
  await user.click(getByRole('button', { name: 'set min count' }))
  expect(setState.mock.calls).toEqual([
    [{ ...defaultRecord, s_min_count: '7' }],
  ])
})

test('max count setter commits value', async () => {
  const user = userEvent.setup()
  const setState = vitest.fn()
  const { getByRole } = render(
    <Harness hookProps={defaultProps({ setState })} maxCountArg={42} />,
  )
  setState.mockClear()
  await user.click(getByRole('button', { name: 'set max count' }))
  expect(setState.mock.calls).toEqual([
    [{ ...defaultRecord, s_max_count: '42' }],
  ])
})

test('count setter rounds to nearest integer string', async () => {
  const user = userEvent.setup()
  const setState = vitest.fn()
  const { getByRole } = render(
    <Harness hookProps={defaultProps({ setState })} minCountArg={7.6} />,
  )
  setState.mockClear()
  await user.click(getByRole('button', { name: 'set min count' }))
  expect(setState.mock.calls).toEqual([
    [{ ...defaultRecord, s_min_count: '8' }],
  ])
})

test('min average setter commits two-decimal string', async () => {
  const user = userEvent.setup()
  const setState = vitest.fn()
  const { getByRole } = render(
    <Harness hookProps={defaultProps({ setState })} minAvgArg={8} />,
  )
  setState.mockClear()
  await user.click(getByRole('button', { name: 'set min average' }))
  expect(setState.mock.calls).toEqual([
    [{ ...defaultRecord, s_min_avg: '8.00' }],
  ])
})

test('max average setter commits two-decimal string', async () => {
  const user = userEvent.setup()
  const setState = vitest.fn()
  const { getByRole } = render(
    <Harness hookProps={defaultProps({ setState })} maxAvgArg={9} />,
  )
  setState.mockClear()
  await user.click(getByRole('button', { name: 'set max average' }))
  expect(setState.mock.calls).toEqual([
    [{ ...defaultRecord, s_max_avg: '9.00' }],
  ])
})

test('average setter rounds to two decimals', async () => {
  const user = userEvent.setup()
  const setState = vitest.fn()
  const { getByRole } = render(
    <Harness hookProps={defaultProps({ setState })} minAvgArg={7.567} />,
  )
  setState.mockClear()
  await user.click(getByRole('button', { name: 'set min average' }))
  expect(setState.mock.calls).toEqual([
    [{ ...defaultRecord, s_min_avg: '7.57' }],
  ])
})

test('time start setter commits formatted year-month', async () => {
  const user = userEvent.setup()
  const setState = vitest.fn()
  const { getByRole } = render(
    <Harness
      hookProps={defaultProps({ setState })}
      timeStartArg={{ year: 2020, month: 4 }}
    />,
  )
  setState.mockClear()
  await user.click(getByRole('button', { name: 'set time start' }))
  expect(setState.mock.calls).toEqual([
    [{ ...defaultRecord, s_time_start: '2020-04' }],
  ])
})

test('time end setter commits formatted year-month', async () => {
  const user = userEvent.setup()
  const setState = vitest.fn()
  const { getByRole } = render(
    <Harness
      hookProps={defaultProps({ setState })}
      timeEndArg={{ year: 2021, month: 11 }}
    />,
  )
  setState.mockClear()
  await user.click(getByRole('button', { name: 'set time end' }))
  expect(setState.mock.calls).toEqual([
    [{ ...defaultRecord, s_time_end: '2021-11' }],
  ])
})

test('setters rebuild from committed state, keeping other keys', async () => {
  const user = userEvent.setup()
  const setState = vitest.fn()
  const populated = {
    s_min_count: '3',
    s_max_count: '99',
    s_min_avg: '6.50',
    s_max_avg: '9.25',
    s_time_start: '2019-03',
    s_time_end: '2022-08',
    s_order: 'count',
    s_direction: 'desc',
    s_filters: '1',
  }
  const { getByRole } = render(
    <Harness
      hookProps={defaultProps({
        setState,
        search: makeSearchParams(populated),
      })}
      minCountArg={7}
    />,
  )
  setState.mockClear()
  await user.click(getByRole('button', { name: 'set min count' }))
  expect(setState.mock.calls).toEqual([[{ ...populated, s_min_count: '7' }]])
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
  expect(setState.mock.calls).toEqual([[{ ...defaultRecord, s_filters: '1' }]])
})

test('setIsFiltersOpen false commits synchronously', async () => {
  const user = userEvent.setup()
  const setState = vitest.fn()
  const { getByRole } = render(
    <Harness
      hookProps={defaultProps({
        setState,
        search: makeSearchParams({ s_filters: '1' }),
      })}
      filtersOpenArg={false}
    />,
  )
  setState.mockClear()
  await user.click(getByRole('button', { name: 'set filters open' }))
  expect(setState.mock.calls).toEqual([[{ ...defaultRecord, s_filters: '0' }]])
})

// Group 8: changeSortingOrder.

test('changeSortingOrder toggles direction for same order asc', async () => {
  const user = userEvent.setup()
  const setState = vitest.fn()
  const { getByRole } = render(
    <Harness
      hookProps={defaultProps({
        setState,
        search: makeSearchParams({ s_order: 'count', s_direction: 'asc' }),
      })}
      orderArg={'count'}
    />,
  )
  setState.mockClear()
  await user.click(getByRole('button', { name: 'change order' }))
  expect(setState.mock.calls).toEqual([
    [{ ...defaultRecord, s_order: 'count', s_direction: 'desc' }],
  ])
})

test('changeSortingOrder toggles direction for same order desc', async () => {
  const user = userEvent.setup()
  const setState = vitest.fn()
  const { getByRole } = render(
    <Harness
      hookProps={defaultProps({
        setState,
        search: makeSearchParams({ s_order: 'count', s_direction: 'desc' }),
      })}
      orderArg={'count'}
    />,
  )
  setState.mockClear()
  await user.click(getByRole('button', { name: 'change order' }))
  expect(setState.mock.calls).toEqual([
    [{ ...defaultRecord, s_order: 'count', s_direction: 'asc' }],
  ])
})

test('changeSortingOrder to nameProperty sets ascending', async () => {
  const user = userEvent.setup()
  const setState = vitest.fn()
  const { getByRole } = render(
    <Harness
      hookProps={defaultProps({
        setState,
        search: makeSearchParams({ s_order: 'count', s_direction: 'desc' }),
      })}
      orderArg={'text'}
    />,
  )
  setState.mockClear()
  await user.click(getByRole('button', { name: 'change order' }))
  expect(setState.mock.calls).toEqual([
    [{ ...defaultRecord, s_order: 'text', s_direction: 'asc' }],
  ])
})

test('changeSortingOrder to non-nameProperty sets descending', async () => {
  const user = userEvent.setup()
  const setState = vitest.fn()
  const { getByRole } = render(
    <Harness hookProps={defaultProps({ setState })} orderArg={'count'} />,
  )
  setState.mockClear()
  await user.click(getByRole('button', { name: 'change order' }))
  expect(setState.mock.calls).toEqual([
    [{ ...defaultRecord, s_order: 'count', s_direction: 'desc' }],
  ])
})

test('changeSortingOrder ascending follows the nameProperty prop', async () => {
  const user = userEvent.setup()
  const setState = vitest.fn()
  const { getByRole } = render(
    <Harness
      hookProps={defaultProps({ setState, nameProperty: 'count' })}
      orderArg={'count'}
    />,
  )
  setState.mockClear()
  await user.click(getByRole('button', { name: 'change order' }))
  expect(setState.mock.calls).toEqual([
    [{ ...defaultRecord, s_order: 'count', s_direction: 'asc' }],
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
        search: makeSearchParams({ s_order: 'count' }),
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
        search: makeSearchParams({ s_min_avg: '7.00' }),
      })}
    />,
  )
  expect(getByTestId('changeDetectionString').textContent).not.toEqual(first)
})
