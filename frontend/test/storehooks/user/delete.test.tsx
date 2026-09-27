import { test } from '../../test'
import { assertCalledWith } from '../../assert'
import { mockFunction } from '../../mock'
import { render, waitFor } from '../../render'

import deleteUser from '../../../src/storehooks/user/delete'
import type { UseDeleteUser } from '../../../src/storehooks/user/types'
import { setupUser } from '../../user-event'
import { createErrorLogger } from '../../error-logger'

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
  const onDelete = mockFunction()

  const { getByRole } = render(<Helper onDelete={onDelete} />)

  await user.click(getByRole('button', { name: 'Delete' }))
  await waitFor(() => {
    assertCalledWith(onDelete, [userId])
  })
})
