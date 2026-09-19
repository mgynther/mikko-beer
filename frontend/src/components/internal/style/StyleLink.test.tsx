import { render } from '@testing-library/react'
import { test } from 'vitest'

import StyleLink from './StyleLink'
import { testLink } from '../../../../test-util/link'

test('renders style link', () => {
  const styleName = 'Quadruple'
  const { getByRole } = render(
    <StyleLink
      linkComponent={testLink}
      style={{
        id: 'abee1577-6ecb-4144-8d09-20e13b479ec3',
        name: styleName,
      }}
    />,
  )
  getByRole('link', { name: styleName })
})
