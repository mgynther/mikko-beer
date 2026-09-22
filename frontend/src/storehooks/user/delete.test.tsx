import { expect, test, vitest } from 'vitest'
import { render, waitFor } from '@testing-library/react'

import deleteUser from './delete'
import type { UseDeleteUser } from './types'
import { setupUser } from '../../../test-util/user-event'
import { createErrorLogger } from '../../../test-util/error-logger'

// A stub for the store function, for the reason given in
// storehooks/brewery/get.test.tsx. Deleting validates nothing: what is proven
// here is that the id reaches the store.
const userId = '5de58dcf-e515-49ea-8a8b-5bf22d3087cb'

function Helper(props: {
  onDelete: (userId: string) => void
}): React.JSX.Element {
  const useStoreDelete: UseDeleteUser = () => ({
    delete: async (id: string): Promise<void> => {
      props.onDelete(id)
    },
  })
  const { delete: deleteById } = deleteUser(useStoreDelete).useDelete()
  return (
    <button
      type='button'
      onClick={() => {
        deleteById(userId).catch(
          createErrorLogger('deleteById failed', console.error),
        )
      }}
    >
      Delete
    </button>
  )
}

test('delete user', async () => {
  const user = setupUser()
  const onDelete = vitest.fn()

  const { getByRole } = render(<Helper onDelete={onDelete} />)

  await user.click(getByRole('button', { name: 'Delete' }))
  await waitFor(() => {
    expect(onDelete).toHaveBeenCalledWith(userId)
  })
})
