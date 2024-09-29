import { render } from '@testing-library/react'
import { test } from 'vitest'
import { BrowserRouter } from 'react-router-dom'

import Link from './Link'

test('renders link', () => {
  const { getByRole } = render(
    <BrowserRouter>
      <Link
        to="/testing"
        text="Link text"
      />
    </BrowserRouter>
  )
  getByRole('link', { name: 'Link text' })
})
