import { render } from '@testing-library/react'
import { expect, test, vitest } from 'vitest'
import Container from './Container'
import type { BreweryStyleParams } from '../../core/stats/types'

test('renders container stats', () => {
  const stats = vitest.fn()
  const breweryId = 'e6887360-78da-49e2-b876-68477c79c776'
  const styleId = '2b885977-a2fd-43c2-95f9-6b19f3c8054d'
  const { getByText } = render(
    <Container
      getContainerStatsIf={{
        useStats: (params: BreweryStyleParams) => {
          stats(params)
          return {
            stats: {
              container: [
                {
                  containerId: 'f6937cf3-e0fa-4c6b-92b5-f374242342f6',
                  containerSize: '0.25',
                  containerType: 'draft',
                  reviewAverage: '7.87',
                  reviewCount: '10'
                },
                {
                  containerId: 'f908dc6a-3ed7-49e1-8caf-6ae1b9aac4ff',
                  containerSize: '0.33',
                  containerType: 'bottle',
                  reviewAverage: '8.23',
                  reviewCount: '24'
                }
              ]
            },
            isLoading: false
          }
        }
      }}
      breweryId={breweryId}
      styleId={styleId}
    />
  )
  expect(stats.mock.calls).toEqual([[{ breweryId, styleId }]])
  getByText('7.87')
  getByText('10')
  getByText('draft 0.25')
  getByText('8.23')
  getByText('24')
  getByText('bottle 0.33')
})
