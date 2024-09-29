import { render } from '@testing-library/react'
import { test } from 'vitest'
import LinkWrapper from '../LinkWrapper'

import Link from './Link'

test('renders link', () => {
  const { getByRole } = render(
    <LinkWrapper>
      <Link
        to="/testing"
        text="Link text"
      />
    </LinkWrapper>
  )
  getByRole('link', { name: 'Link text' })
})
