import { fireEvent, render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, test, vitest } from 'vitest'
import Style from './Style'
import LinkWrapper from '../LinkWrapper'
import type {
  GetStyleStatsIf,
  StyleStatsSortingOrder,
  StyleStatsQueryParams
} from '../../core/stats/types'
import type { ListDirection } from '../../core/types'
import { openFilters } from './filters-test-util'

const breweryId = 'd02852f6-8cef-40fd-9dfd-2cf5489de63e'
const styleId = '4169b690-b1ab-4385-84ce-2fae277d7dd5'

const pils = {
  styleId: '14142347-762b-4b4b-b657-731a19ec5eb8',
  styleName: 'Pils',
  reviewAverage: '8.73',
  reviewCount: '72'
}

const ipa = {
  styleId: '6cf37273-2f07-47a2-b987-b5a54e292e60',
  styleName: 'IPA',
  reviewAverage: '8.91',
  reviewCount: '92'
}

const statsResult = {
  stats: {
    style: [ipa, pils],
  },
  isLoading: false
}

const defaultParams = {
  breweryId: undefined,
  maxReviewAverage: 10,
  maxReviewCount: Infinity,
  minReviewAverage: 4.0,
  minReviewCount: 1,
  sorting: {
    direction: 'asc',
    order: 'style_name',
  },
  styleId: undefined
}

const getRecordingIf = (
  statsRequests: (params: StyleStatsQueryParams) => void
): GetStyleStatsIf => ({
  useStats: (params: StyleStatsQueryParams) => {
    statsRequests(params)
    return statsResult
  }
})

test('renders style stats', () => {
  const { getByText } = render(
    <LinkWrapper>
      <Style
        getStyleStatsIf={{
          useStats: () => statsResult
        }}
        breweryId={undefined}
        styleId={undefined}
      />
    </LinkWrapper>
  )
  getByText(pils.styleName)
  getByText(pils.reviewAverage)
  getByText(pils.reviewCount)
  getByText(ipa.styleName)
  getByText(ipa.reviewAverage)
  getByText(ipa.reviewCount)
})

test('sets minimum review count filter', async () => {
  const user = userEvent.setup()
  const statsRequests = vitest.fn()
  const { getByDisplayValue, getByRole } = render(
    <LinkWrapper>
      <Style
        getStyleStatsIf={getRecordingIf(statsRequests)}
        breweryId={undefined}
        styleId={undefined}
      />
    </LinkWrapper>
  )
  await openFilters(getByRole, user)
  const slider = getByDisplayValue('0')
  fireEvent.change(slider, {target: {value: '1'}})
  const calls = statsRequests.mock.calls
  expect(calls.length).toEqual(2)
  expect(calls[1]).toEqual([{
    ...defaultParams,
    minReviewCount: 2
  }])
})

test('sets maximum review count filter', async () => {
  const user = userEvent.setup()
  const statsRequests = vitest.fn()
  const { getByDisplayValue, getByRole } = render(
    <LinkWrapper>
      <Style
        getStyleStatsIf={getRecordingIf(statsRequests)}
        breweryId={undefined}
        styleId={undefined}
      />
    </LinkWrapper>
  )
  await openFilters(getByRole, user)
  const slider = getByDisplayValue('11')
  fireEvent.change(slider, {target: {value: '10'}})
  const calls = statsRequests.mock.calls
  expect(calls.length).toEqual(2)
  expect(calls[1]).toEqual([{
    ...defaultParams,
    maxReviewCount: 144
  }])
})

test('sets minimum review average filter', async () => {
  const user = userEvent.setup()
  const statsRequests = vitest.fn()
  const { getByDisplayValue, getByRole } = render(
    <LinkWrapper>
      <Style
        getStyleStatsIf={getRecordingIf(statsRequests)}
        breweryId={undefined}
        styleId={undefined}
      />
    </LinkWrapper>
  )
  await openFilters(getByRole, user)
  const slider = getByDisplayValue('4')
  fireEvent.change(slider, {target: {value: '4.5'}})
  const calls = statsRequests.mock.calls
  expect(calls.length).toEqual(2)
  expect(calls[1]).toEqual([{
    ...defaultParams,
    minReviewAverage: 4.5
  }])
})

test('sets maximum review average filter', async () => {
  const user = userEvent.setup()
  const statsRequests = vitest.fn()
  const { getByDisplayValue, getByRole } = render(
    <LinkWrapper>
      <Style
        getStyleStatsIf={getRecordingIf(statsRequests)}
        breweryId={undefined}
        styleId={undefined}
      />
    </LinkWrapper>
  )
  await openFilters(getByRole, user)
  const slider = getByDisplayValue('10')
  fireEvent.change(slider, {target: {value: '9.4'}})
  const calls = statsRequests.mock.calls
  expect(calls.length).toEqual(2)
  expect(calls[1]).toEqual([{
    ...defaultParams,
    maxReviewAverage: 9.4
  }])
})

test('uses ids', async () => {
  const statsRequests = vitest.fn()
  render(
    <LinkWrapper>
      <Style
        getStyleStatsIf={getRecordingIf(statsRequests)}
        breweryId={breweryId}
        styleId={styleId}
      />
    </LinkWrapper>
  )
  const calls = statsRequests.mock.calls
  expect(calls.length).toEqual(1)
  expect(calls[0]).toEqual([{
    ...defaultParams,
    breweryId,
    styleId
  }])
})

interface OrderTestData {
  buttonText: string
  expectedOrder: StyleStatsSortingOrder
  order: StyleStatsSortingOrder
  expectedDirection: ListDirection
  testName: string
}

const orderTests: OrderTestData[] = [
  {
    buttonText: 'Style ▲',
    expectedOrder: 'style_name',
    order: 'style_name',
    expectedDirection: 'desc',
    testName: 'brewery name, flip order'
  },
  {
    buttonText: 'Reviews',
    expectedOrder: 'count',
    order: 'style_name',
    expectedDirection: 'desc',
    testName: 'reviews'
  },
  {
    buttonText: 'Average',
    expectedOrder: 'average',
    order: 'style_name',
    expectedDirection: 'desc',
    testName: 'average'
  }
]

orderTests.forEach(data => {
  test(`set order to ${data.testName}`, async () => {
    const user = userEvent.setup()
    const statsRequests = vitest.fn()
    const { getByRole } = render(
      <LinkWrapper>
        <Style
          getStyleStatsIf={getRecordingIf(statsRequests)}
          breweryId={undefined}
          styleId={undefined}
        />
      </LinkWrapper>
    )
    const orderButton = getByRole('button', { name: data.buttonText })
    await user.click(orderButton)
    const calls = statsRequests.mock.calls
    expect(calls.length).toEqual(2)
    expect(calls[1]).toEqual([{
      ...defaultParams,
      sorting: {
        order: data.expectedOrder,
        direction: data.expectedDirection
      }
    }])
  })
})

interface TwoTimeOrderTestData extends OrderTestData {
  initialButtonText: string
}

const twoTimeOrderTests: TwoTimeOrderTestData[] = [
  {
    initialButtonText: 'Style ▲',
    buttonText: 'Style ▼',
    expectedOrder: 'style_name',
    order: 'style_name',
    expectedDirection: 'asc',
    testName: 'style name, flip order'
  },
  {
    initialButtonText: 'Reviews',
    buttonText: 'Reviews ▼',
    expectedOrder: 'count',
    order: 'style_name',
    expectedDirection: 'asc',
    testName: 'reviews'
  },
  {
    initialButtonText: 'Average',
    buttonText: 'Average ▼',
    expectedOrder: 'average',
    order: 'style_name',
    expectedDirection: 'asc',
    testName: 'average'
  }
]

twoTimeOrderTests.forEach(data => {
  test(`set two time order to ${data.testName}`, async () => {
    const user = userEvent.setup()
    const statsRequests = vitest.fn()
    const { getByRole } = render(
      <LinkWrapper>
        <Style
          getStyleStatsIf={getRecordingIf(statsRequests)}
          breweryId={undefined}
          styleId={undefined}
        />
      </LinkWrapper>
    )
    const firstButton = getByRole('button', { name: data.initialButtonText })
    await user.click(firstButton)
    const secondButton = getByRole('button', { name: data.buttonText })
    await user.click(secondButton)
    const calls = statsRequests.mock.calls
    expect(calls.length).toEqual(3)
    expect(calls[2]).toEqual([{
      ...defaultParams,
      sorting: {
        order: data.expectedOrder,
        direction: data.expectedDirection
      }
    }])
  })
})
