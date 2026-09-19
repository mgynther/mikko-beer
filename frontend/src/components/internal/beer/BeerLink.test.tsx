import { render } from '@testing-library/react'
import { test } from 'vitest'

import BeerLink from './BeerLink'
import { testLink } from '../../../../test-util/link'

test('renders beer link', () => {
  const beerName = 'Siperia'
  const { getByRole } = render(
    <BeerLink
      linkComponent={testLink}
      beer={{
        id: 'b71b0c12-0538-48ca-9c82-75e84caca818',
        name: beerName,
      }}
    />,
  )
  getByRole('link', { name: beerName })
})
