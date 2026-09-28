import { test } from '../../test'
import { assertCalled } from '../../assert'
import { mockFunction } from '../../mock'
import { render, waitFor } from '../../render'

import logout from '../../../src/storehooks/login/logout'
import type { UseLogout } from '../../../src/storehooks/login/types'
import { setupUser } from '../../user-event'
import { createErrorLogger } from '../../error-logger'

// A stub for the store function, for the reason given in
// storehooks/brewery/get.test.tsx. Logging out validates nothing and takes
// nothing: what is proven here is that the call reaches the store.
function Helper(props: { onLogout: () => void }): React.JSX.Element {
  const useStoreLogout: UseLogout = () => ({
    logout: async (): Promise<void> => {
      props.onLogout()
    },
  })
  const { logout: doLogout } = logout(useStoreLogout).useLogout()
  return (
    <button
      type='button'
      onClick={() => {
        doLogout().catch(createErrorLogger('doLogout failed', console.error))
      }}
    >
      Logout
    </button>
  )
}

test('logout', async () => {
  const user = setupUser()
  const onLogout = mockFunction<[]>()

  const { getByRole } = render(<Helper onLogout={onLogout} />)

  await user.click(getByRole('button', { name: 'Logout' }))
  await waitFor(() => {
    assertCalled(onLogout)
  })
})
