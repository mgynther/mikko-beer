import { render } from '@testing-library/react'
import { test } from 'vitest'

import Root from './Root'

test('render root', () => {
  const { getByRole } = render(<Root />)
  getByRole('heading', { name: 'Login' })
})
