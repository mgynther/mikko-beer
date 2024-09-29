import { render } from '@testing-library/react'
import { test } from 'vitest'
import { BrowserRouter } from 'react-router-dom'

import BreweryLinks from './BreweryLinks'

test('renders brewery links', () => {
  const { getByRole } = render(
    <BrowserRouter>
      <BreweryLinks
        breweries={[
          {
            id: 'b2caed2c-4751-4475-9bdd-a1b75ca9a021',
            name: '1'
          },
          {
            id: '17d61d07-3cb8-404d-a3a1-1f4f947dc158',
            name: '2'
          }
        ]}
      />
    </BrowserRouter>
  )
  getByRole('link', { name: '1' })
  getByRole('link', { name: '2' })
})
