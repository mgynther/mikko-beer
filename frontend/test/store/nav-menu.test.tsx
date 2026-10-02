import { test } from '../test'
import { assertDefined } from '../assert'
import { render } from '../render'

import { setupUser } from '../user-event'

import { createServer } from './server'
import { createMemoryStorage } from '../memory-storage'
import { createStoreProvider } from '../../src/store/provider'
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
  const server = await createServer()
  const webStorage = createMemoryStorage()
  const user = setupUser()
  const StoreProvider = createStoreProvider(server.url, webStorage)
  const { getByText } = render(
    <StoreProvider>
      <Helper />
    </StoreProvider>,
  )
  assertDefined(getByText('COLLAPSED'))

  await user.click(getByText('Expand'))
  assertDefined(getByText('EXPANDED'))
})
