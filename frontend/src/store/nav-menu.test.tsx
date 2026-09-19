import { expect, test } from 'vitest'
import { render } from '@testing-library/react'

import { setupUser } from '../../test-util/user-event'

import { StoreProvider } from './provider'
import { useNavMenu } from './nav-menu'

function Helper(): React.JSX.Element {
  const { navMenuState, setNavMenuState } = useNavMenu()
  return (
    <div>
      <button
        type='button'
        onClick={() => {
          setNavMenuState('EXPANDED')
        }}
      >
        Expand
      </button>
      {navMenuState}
    </div>
  )
}

test('expand nav menu', async () => {
  const user = setupUser()
  const { getByText } = render(
    <StoreProvider>
      <Helper />
    </StoreProvider>,
  )
  expect(getByText('COLLAPSED')).toBeDefined()

  await user.click(getByText('Expand'))
  expect(getByText('EXPANDED')).toBeDefined()
})
