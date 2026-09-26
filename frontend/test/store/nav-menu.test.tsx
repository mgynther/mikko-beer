import { expect, test } from 'vitest'
import { render } from '@testing-library/react'

import { setupUser } from '../user-event'

import { StoreProvider } from '../../src/store/provider'
import { useNavMenu } from '../../src/store/nav-menu'

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
