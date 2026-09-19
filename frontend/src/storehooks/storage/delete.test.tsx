import { expect, test, vitest } from 'vitest'
import { render, waitFor } from '@testing-library/react'

import deleteStorage from './delete'
import type { UseDeleteStorage } from './types'
import { setupUser } from '../../../test-util/user-event'

// A stub for the store function, for the reason given in
// storehooks/brewery/get.test.tsx. Deleting validates nothing: what is proven
// here is that the id reaches the store.
const storageId = 'b1e6e1c3-6a2f-4f3e-9d7c-6a2f4f3e9d7c'

function Helper(props: {
  onDelete: (storageId: string) => void
}): React.JSX.Element {
  const useStoreDelete: UseDeleteStorage = () => ({
    delete: async (id: string): Promise<void> => {
      props.onDelete(id)
    },
  })
  const { delete: deleteById } = deleteStorage(useStoreDelete).useDelete()
  return (
    <button
      type='button'
      onClick={() => {
        void deleteById(storageId)
      }}
    >
      Delete
    </button>
  )
}

test('delete storage', async () => {
  const user = setupUser()
  const onDelete = vitest.fn()

  const { getByRole } = render(<Helper onDelete={onDelete} />)

  await user.click(getByRole('button', { name: 'Delete' }))
  await waitFor(() => {
    expect(onDelete).toHaveBeenCalledWith(storageId)
  })
})
