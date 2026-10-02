import { test } from '../test'
import { assertDefined } from '../assert'
import { render } from '../render'

import { setupUser } from '../user-event'

import { createServer } from './server'
import { createMemoryStorage } from '../memory-storage'
import { createStoreProvider } from '../../src/store/provider'
import { useTheme } from '../../src/store/theme'

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
  const server = await createServer()
  const webStorage = createMemoryStorage()
  const user = setupUser()
  const StoreProvider = createStoreProvider(server.url, webStorage)
  const { getByText } = render(
    <StoreProvider>
      <Helper />
    </StoreProvider>,
  )
  assertDefined(getByText('LIGHT'))

  await user.click(getByText('Darken'))
  assertDefined(getByText('DARK'))
})
