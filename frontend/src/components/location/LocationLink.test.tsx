import { render } from '@testing-library/react'
import { test } from 'vitest'
import LinkWrapper from '../LinkWrapper'

import LocationLink from './LocationLink'

test('renders brewery links', () => {
  const { getByRole } = render(
    <LinkWrapper>
      <LocationLink
        location={
          {
            id: '353cd4be-b9c9-49e4-8de0-d1f1c9b38c7f',
            name: '1'
          }
        }
      />
    </LinkWrapper>
  )
  getByRole('link', { name: '1' })
})
