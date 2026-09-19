import { expect, test } from 'vitest'
import { render } from '@testing-library/react'
import { setupUser } from '../../test-util/user-event'

import LinkWrapper from './LinkWrapper'
import { Link } from './link'

test('renders a link that navigates', async () => {
  const user = setupUser()
  const path = '/testing'
  const { getByRole } = render(
    <LinkWrapper>
      <Link to={path} text='Link text' />
    </LinkWrapper>,
  )
  const link = getByRole('link', { name: 'Link text' })
  expect(link.getAttribute('href')).toEqual(path)
  await user.click(link)
  expect(window.location.pathname).toEqual(path)
})
