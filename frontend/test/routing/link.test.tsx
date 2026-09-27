import { test } from '../test'
import { assertEqual } from '../assert'
import { render } from '../render'
import { setupUser } from '../user-event'

import LinkWrapper from '../../src/routing/LinkWrapper'
import { Link } from '../../src/routing/link'

test('renders a link that navigates', async () => {
  const user = setupUser()
  const path = '/testing'
  const { getByRole } = render(
    <LinkWrapper>
      <Link to={path} text='Link text' />
    </LinkWrapper>,
  )
  const link = getByRole('link', { name: 'Link text' })
  assertEqual(link.getAttribute('href'), path)
  await user.click(link)
  assertEqual(window.location.pathname, path)
})
