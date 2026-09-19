import { expect, test, vitest } from 'vitest'
import { render, waitFor } from '@testing-library/react'

import logout from './logout'
import type { LogoutParams, UseLogout } from './types'
import { setupUser } from '../../../test-util/user-event'

// A stub for the store function, for the reason given in
// storehooks/brewery/get.test.tsx. Logging out validates nothing: what is
// proven here is that the parameters reach the store.
const params: LogoutParams = {
  userId: '8e5b4c3d-2e1f-4098-8776-5e4d3c2b1a09',
  body: { refreshToken: 'refresh' },
}

function Helper(props: {
  onLogout: (params: LogoutParams) => void
}): React.JSX.Element {
  const useStoreLogout: UseLogout = () => ({
    logout: async (logoutParams: LogoutParams): Promise<void> => {
      props.onLogout(logoutParams)
    },
  })
  const { logout: doLogout } = logout(useStoreLogout).useLogout()
  return (
    <button
      type='button'
      onClick={() => {
        void doLogout(params)
      }}
    >
      Logout
    </button>
  )
}

test('logout', async () => {
  const user = setupUser()
  const onLogout = vitest.fn()

  const { getByRole } = render(<Helper onLogout={onLogout} />)

  await user.click(getByRole('button', { name: 'Logout' }))
  await waitFor(() => {
    expect(onLogout).toHaveBeenCalledWith(params)
  })
})
