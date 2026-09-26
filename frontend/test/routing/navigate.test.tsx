import { expect, test } from 'vitest'
import { render } from '@testing-library/react'
import { setupUser } from '../user-event'

import LinkWrapper from '../../src/routing/LinkWrapper'
import { navigateIf } from '../../src/routing/navigate'
import { createErrorLogger } from '../error-logger'

// react-router's own navigate answers void | Promise<void>, so this layer
// wraps it into one that always answers a promise. What the wrapper has to
// keep doing is navigating.
function Navigator(props: { to: string }): React.JSX.Element {
  const navigate = navigateIf.useNavigate()
  return (
    <button
      type='button'
      onClick={() => {
        navigate(props.to).catch(
          createErrorLogger('navigate failed', console.error),
        )
      }}
    >
      Navigate
    </button>
  )
}

test('navigates', async () => {
  const user = setupUser()
  const path = '/testing-navigate'
  const { getByRole } = render(
    <LinkWrapper>
      <Navigator to={path} />
    </LinkWrapper>,
  )
  await user.click(getByRole('button', { name: 'Navigate' }))
  expect(window.location.pathname).toEqual(path)
})
