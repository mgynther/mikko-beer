import { act, render, waitFor } from '@testing-library/react'
import { expect, test, vitest } from 'vitest'
import AnnualContainer from './AnnualContainer'
import LinkWrapper from '../LinkWrapper'
import type { OneAnnualContainerStats } from '../../core/stats/types'

const stats2023: OneAnnualContainerStats = {
  containerId: '08d61e11-7669-44b1-9252-a45fc99d53a7',
  containerSize: '0.33',
  containerType: 'bottle',
  reviewAverage: '9.06',
  reviewCount: '63',
  year: '2023'
}

const stats2022: OneAnnualContainerStats = {
  containerId: 'dd447b18-7f7e-4341-95e0-b37643bf8ca9',
  containerSize: '0.44',
  containerType: 'can',
  reviewAverage: '9.12',
  reviewCount: '67',
  year: '2022'
}

const annualContainerStats = {
  annualContainer: [{ ...stats2023 }, { ...stats2022 }]
}
const emptyStats = { annualContainer: []}

const usedStats = {
  useStats: () => ({
    query: async () => annualContainerStats,
    stats: emptyStats,
    isLoading: false
  }),
  infiniteScroll: (cb: () => void) => {
    cb()
    return () => undefined
  }
}

test('queries annualContainer stats', async () => {
  const query = vitest.fn()
  let loadCallback: () => void = () => undefined
  render(
    <LinkWrapper>
      <AnnualContainer
        getAnnualContainerStatsIf={{
          useStats: () => ({
            query: async (params) => {
              query(params)
              return {
                annualContainer: [
                  { ...stats2023 },
                  { ...stats2022 }
                ]
              }
            },
            stats: {
              annualContainer: []
            },
            isLoading: false
          }),
          infiniteScroll: (cb) => {
            loadCallback = cb
            return () => undefined
          }
        }}
        breweryId={undefined}
        locationId={undefined}
        styleId={undefined}
      />
    </LinkWrapper>
  )
  expect(query.mock.calls).toEqual([])
  await act(async() => { loadCallback(); })
  expect(query.mock.calls).toEqual([[{
    breweryId: undefined,
    locationId: undefined,
    pagination: {
      size: 30,
      skip: 0
    },
    styleId: undefined
  }]])
})

test('queries filtered annual container stats', async () => {
  const query = vitest.fn()
  const breweryId = 'c876a4bb-8899-41de-a413-afbb5faea82c'
  const locationId = '305f744e-7e5d-4bde-b528-4e74150b8db5'
  const styleId = '84a0e394-d051-4001-852a-df997190f836'
  let loadCallback: () => void = () => undefined
  render(
    <LinkWrapper>
      <AnnualContainer
        getAnnualContainerStatsIf={{
          useStats: () => ({
            query: async (params) => {
              query(params)
              return {
                annualContainer: [
                  { ...stats2023 },
                  { ...stats2022 }
                ]
              }
            },
            stats: {
              annualContainer: []
            },
            isLoading: false
          }),
          infiniteScroll: (cb) => {
            loadCallback = cb
            return () => undefined
          }
        }}
        breweryId={breweryId}
        locationId={locationId}
        styleId={styleId}
      />
    </LinkWrapper>
  )
  await act(async() => { loadCallback(); })
  expect(query.mock.calls).toEqual([[{
    breweryId,
    locationId,
    pagination: {
      size: 10000,
      skip: 0
    },
    styleId
  }]])
})

test('renders annual container stats', async () => {
  const { getByText } = render(
    <LinkWrapper>
      <AnnualContainer
        breweryId={'6db973a1-5378-4e0c-856e-1ae8b94613c7'}
        locationId={'0f8419fe-75c8-4153-99a9-eee4f8ae5a77'}
        styleId={undefined}
        getAnnualContainerStatsIf={usedStats}
      />
    </LinkWrapper>
  )
  await waitFor(() => getByText(stats2023.year))
  getByText(stats2023.reviewAverage)
  getByText(stats2023.reviewCount)
  getByText(stats2022.year)
  getByText(stats2022.reviewAverage)
  getByText(stats2022.reviewCount)
})
