import { render } from '@testing-library/react'
import { test } from 'vitest'

import LocationLink from './LocationLink'
import { testLink } from '../../../../test-util/link'

test('renders brewery links', () => {
  const { getByRole } = render(
    <LocationLink
      linkComponent={testLink}
      location={{
        id: '353cd4be-b9c9-49e4-8de0-d1f1c9b38c7f',
        name: '1',
      }}
    />,
  )
  getByRole('link', { name: '1' })
})
