import { fireEvent, render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, test, vitest } from 'vitest'
import Container from './Container'
import type {
  BreweryStyleParams,
  OneContainerStats
} from '../../core/stats/types'
import { openFilters } from './filters-test-util'

const breweryId = 'e6887360-78da-49e2-b876-68477c79c776'
const styleId = '2b885977-a2fd-43c2-95f9-6b19f3c8054d'

const containerStats: OneContainerStats[] = [
  {
    containerId: 'f6937cf3-e0fa-4c6b-92b5-f374242342f6',
    containerSize: '0.25',
    containerType: 'draft',
    reviewAverage: '7.87',
    reviewCount: '24'
  },
  {
    containerId: 'f908dc6a-3ed7-49e1-8caf-6ae1b9aac4ff',
    containerSize: '0.33',
    containerType: 'bottle',
    reviewAverage: '8.23',
    reviewCount: '10'
  }
]

function renderContainer (
  stats?: ReturnType<typeof vitest.fn>
): ReturnType<typeof render> {
  return render(
    <Container
      getContainerStatsIf={{
        useStats: (params: BreweryStyleParams) => {
          if (stats !== undefined) {
            stats(params)
          }
          return {
            stats: {
              container: containerStats
            },
            isLoading: false
          }
        }
      }}
      breweryId={breweryId}
      styleId={styleId}
    />
  )
}

test('renders container stats', () => {
  const stats = vitest.fn()
  const { getByText } = renderContainer(stats)
  expect(stats.mock.calls).toEqual([[{ breweryId, styleId }]])
  getByText('7.87')
  getByText('10')
  getByText('draft 0.25')
  getByText('8.23')
  getByText('24')
  getByText('bottle 0.33')
})

function changeSlider (
  getByDisplayValue: (str: string) => HTMLElement,
  from: string,
  to: string
): void {
  const slider = getByDisplayValue(from)
  fireEvent.change(slider, {target: { value: to }})
}

test('filter container stats by min average', async () => {
  const user = userEvent.setup()
  const { getByDisplayValue, getByRole, getByText, queryByText } =
    renderContainer()
  await openFilters(getByRole, user)
  changeSlider(getByDisplayValue, '4', '8.1')
  expect(queryByText('7.87')).toEqual(null)
  getByText('8.23')
})

test('filter container stats by max average', async () => {
  const user = userEvent.setup()
  const { getByDisplayValue, getByRole, getByText, queryByText } =
    renderContainer()
  await openFilters(getByRole, user)
  changeSlider(getByDisplayValue, '10', '8.0')
  getByText('7.87')
  expect(queryByText('8.23')).toEqual(null)
})

test('filter container stats by min count', async () => {
  const user = userEvent.setup()
  const { getByDisplayValue, getByRole, getByText, queryByText } =
    renderContainer()
  await openFilters(getByRole, user)
  changeSlider(getByDisplayValue, '0', '5')
  expect(queryByText('10')).toEqual(null)
  getByText('24')
})

test('filter container stats by min count', async () => {
  const user = userEvent.setup()
  const { getByDisplayValue, getByRole, getByText, queryByText } =
    renderContainer()
  await openFilters(getByRole, user)
  changeSlider(getByDisplayValue, '11', '5')
  getByText('10')
  expect(queryByText('24')).toEqual(null)
})

test('order container stats by average desc', async () => {
  const user = userEvent.setup()
  const { getAllByText, getByRole } =
    renderContainer()
  const averageButton = getByRole('button', { name: 'Average' })
  await user.click(averageButton)
  const averages = getAllByText(/7.87|8.23/)
  expect(averages.length).toEqual(2)
  expect(averages[0].innerHTML).toEqual('8.23')
  expect(averages[1].innerHTML).toEqual('7.87')
})

test('order container stats by average asc', async () => {
  const user = userEvent.setup()
  const { getAllByText, getByRole } =
    renderContainer()
  const averageButton = getByRole('button', { name: 'Average' })
  await user.click(averageButton)
  const averageAscButton = getByRole('button', { name: 'Average ▼' })
  await user.click(averageAscButton)
  const averages = getAllByText(/7.87|8.23/)
  expect(averages.length).toEqual(2)
  expect(averages[0].innerHTML).toEqual('7.87')
  expect(averages[1].innerHTML).toEqual('8.23')
})

test('order container stats by count desc', async () => {
  const user = userEvent.setup()
  const { getAllByText, getByRole } =
    renderContainer()
  const averageButton = getByRole('button', { name: 'Reviews' })
  await user.click(averageButton)
  const counts = getAllByText(/10|24/)
  expect(counts.length).toEqual(2)
  expect(counts[0].innerHTML).toEqual('24')
  expect(counts[1].innerHTML).toEqual('10')
})

test('order container stats by average asc', async () => {
  const user = userEvent.setup()
  const { getAllByText, getByRole } =
    renderContainer()
  const countButton = getByRole('button', { name: 'Reviews' })
  await user.click(countButton)
  const countAscButton = getByRole('button', { name: 'Reviews ▼' })
  await user.click(countAscButton)
  const counts = getAllByText(/10|24/)
  expect(counts.length).toEqual(2)
  expect(counts[0].innerHTML).toEqual('10')
  expect(counts[1].innerHTML).toEqual('24')
})

test('order container stats by container desc', async () => {
  const user = userEvent.setup()
  const { getAllByText, getByRole } =
    renderContainer()
  const textButton = getByRole('button', { name: 'Container ▲' })
  await user.click(textButton)
  const containers = getAllByText(/draft 0.25|bottle 0.33/)
  expect(containers.length).toEqual(2)
  expect(containers[0].innerHTML).toEqual('draft 0.25')
  expect(containers[1].innerHTML).toEqual('bottle 0.33')
})

test('order container stats by container asc', async () => {
  const user = userEvent.setup()
  const { getAllByText, getByRole } =
    renderContainer()
  const textButton = getByRole('button', { name: 'Container ▲' })
  await user.click(textButton)
  const textAscButton = getByRole('button', { name: 'Container ▼' })
  await user.click(textAscButton)
  const containers = getAllByText(/draft 0.25|bottle 0.33/)
  expect(containers.length).toEqual(2)
  expect(containers[0].innerHTML).toEqual('bottle 0.33')
  expect(containers[1].innerHTML).toEqual('draft 0.25')
})
