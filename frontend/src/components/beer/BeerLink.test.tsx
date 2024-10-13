import { render } from '@testing-library/react'
import { test } from 'vitest'
import LinkWrapper from '../LinkWrapper'

import BeerLink from './BeerLink'

test('renders beer link', () => {
  const beerName = 'Siperia'
  const { getByRole } = render(
    <LinkWrapper>
      <BeerLink
        beer={{
          id: 'b71b0c12-0538-48ca-9c82-75e84caca818',
          name: beerName
        }}
      />
    </LinkWrapper>
  )
  getByRole('link', { name: beerName })
})
