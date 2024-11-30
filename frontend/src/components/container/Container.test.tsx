import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { test } from 'vitest'
import Container from './Container'
import type { Container as ContainerType } from '../../core/container/types'
import { Role } from '../../core/user/types'

const container: ContainerType = {
  id: '790d587e-b4e4-436f-82d3-6d450daba5d2',
  type: 'bottle',
  size: '0.25'
}

function getLogin(role: Role) {
  return () => ({
    user: {
      id: '05952a9e-1c6f-4974-9c1c-4e5fe473b0f7',
      username: 'viewer',
      role
    },
    authToken: 'auth',
    refreshToken: 'refresh'
  })
}

const updateContainerIf = {
  useUpdate: () => ({
    update: async () => undefined,
      isLoading: false
  })
}

test('renders container as viewer', async () => {
  const { getByText } = render(
    <Container
      container={container}
      getLogin={getLogin(Role.viewer)}
      updateContainerIf={updateContainerIf}
    />
  )
  getByText('bottle 0.25')
})

test('renders editable container as admin', async () => {
  const user = userEvent.setup()
  const { getByRole, getByText } = render(
    <Container
      container={container}
      getLogin={getLogin(Role.admin)}
      updateContainerIf={updateContainerIf}
    />
  )
  getByText('bottle 0.25')
  const editButton = getByRole('button', { name: 'Edit' })
  await user.click(editButton)
  const cancelButton = getByRole('button', { name: 'Cancel' })
  await user.click(cancelButton)
  getByRole('button', { name: 'Edit' })
})
