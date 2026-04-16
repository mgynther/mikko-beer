import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, test, vitest } from 'vitest'
import Container from './Container'
import type {
  Container as ContainerType,
  UpdateContainerIf,
} from '../../core/container/types'
import { Role } from '../../core/user/types'
import type { GetLogin } from '../../core/login/types'

const container: ContainerType = {
  id: '790d587e-b4e4-436f-82d3-6d450daba5d2',
  type: 'bottle',
  size: '0.25',
}

function getLogin(role: Role): GetLogin {
  return () => ({
    user: {
      id: '05952a9e-1c6f-4974-9c1c-4e5fe473b0f7',
      username: 'viewer',
      role,
    },
    authToken: 'auth',
    refreshToken: 'refresh',
  })
}

const updateContainerIf: UpdateContainerIf = {
  useUpdate: () => ({
    update: async () => undefined,
    isLoading: false,
  }),
}

test('renders container as viewer', async () => {
  const { getByText } = render(
    <Container
      container={container}
      getLogin={getLogin(Role.viewer)}
      updateContainerIf={updateContainerIf}
    />,
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
    />,
  )
  getByText('bottle 0.25')
  const editButton = getByRole('button', { name: 'Edit' })
  await user.click(editButton)
  const cancelButton = getByRole('button', { name: 'Cancel' })
  await user.click(cancelButton)
  getByRole('button', { name: 'Edit' })
})

test('update container', async () => {
  const user = userEvent.setup()
  const update = vitest.fn()
  const { getByPlaceholderText, getByRole, getByText } = render(
    <Container
      container={container}
      getLogin={getLogin(Role.admin)}
      updateContainerIf={{
        useUpdate: () => ({
          update,
          isLoading: false,
        }),
      }}
    />,
  )
  getByText('bottle 0.25')
  const editButton = getByRole('button', { name: 'Edit' })
  await user.click(editButton)
  const typeInput = getByPlaceholderText('Type')
  typeInput.focus()
  await user.clear(typeInput)
  await user.paste('can')
  const saveButton = getByRole('button', { name: 'Save' })
  await user.click(saveButton)
  expect(update.mock.calls).toEqual([
    [
      {
        ...container,
        type: 'can',
      },
    ],
  ])
  getByRole('button', { name: 'Edit' })
})
