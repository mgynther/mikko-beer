import { render } from '@testing-library/react'
import { test } from 'vitest'
import LinkWrapper from '../LinkWrapper'

import StyleLink from './StyleLink'

test('renders style link', () => {
  const styleName = 'Quadruple'
  const { getByRole } = render(
    <LinkWrapper>
      <StyleLink
        style={{
          id: 'abee1577-6ecb-4144-8d09-20e13b479ec3',
          name: styleName
        }}
      />
    </LinkWrapper>
  )
  getByRole('link', { name: styleName })
})
