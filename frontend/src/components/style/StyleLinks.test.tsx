import { render } from '@testing-library/react'
import { test } from 'vitest'
import LinkWrapper from '../LinkWrapper'

import StyleLinks from './StyleLinks'

test('renders style links', () => {
  const { getByRole } = render(
    <LinkWrapper>
      <StyleLinks
        styles={[
          {
            id: 'fa9d0f48-560d-40d8-9f45-30b0b9dcd239',
            name: '1'
          },
          {
            id: 'de3285ee-3292-4450-a2d6-bd9fb3352453',
            name: '2'
          }
        ]}
      />
    </LinkWrapper>
  )
  getByRole('link', { name: '1' })
  getByRole('link', { name: '2' })
})
