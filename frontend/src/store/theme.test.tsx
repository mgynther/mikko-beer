import { expect, test } from 'vitest'
import { render } from '@testing-library/react'

import { setupUser } from '../../test-util/user-event'

import { StoreProvider } from './provider'
import { useTheme } from './theme'

function Helper(): React.JSX.Element {
  const { theme, setTheme } = useTheme()
  return (
    <div>
      <button
        type='button'
        onClick={() => {
          setTheme('DARK')
        }}
      >
        Darken
      </button>
      {theme}
    </div>
  )
}

test('set theme', async () => {
  const user = setupUser()
  const { getByText } = render(
    <StoreProvider>
      <Helper />
    </StoreProvider>,
  )
  expect(getByText('LIGHT')).toBeDefined()

  await user.click(getByText('Darken'))
  expect(getByText('DARK')).toBeDefined()
})
