import { render } from '@testing-library/react'
import { test } from 'vitest'

import AnnualContainerStatsTable from "./AnnualContainerStatsTable"

test('renders annual container stats', async () => {
  const { getByText } = render(
    <AnnualContainerStatsTable
      annualContainers={[
        {
          containerId: '219f1049-a4c8-43e4-adfb-18ce3913c4aa',
          containerSize: '0.25',
          containerType: 'draft',
          reviewAverage: '9.12',
          reviewCount: '83',
          year: '2023'
        },
        {
          containerId: 'b1c8789d-0c00-4cac-aff5-5fe70708404b',
          containerSize: '0.33',
          containerType: 'bottle',
          reviewAverage: '8.92',
          reviewCount: '64',
          year: '2022'
        }
      ]}
      isLoading={false}
    />
  )
  getByText('2023')
  getByText('draft 0.25')
  getByText('83')
  getByText('9.12')
  getByText('2022')
  getByText('bottle 0.33')
  getByText('64')
  getByText('8.92')
})
