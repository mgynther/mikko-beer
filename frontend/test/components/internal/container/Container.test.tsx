import { test } from '../../../test'
import { assertDeepEqual } from '../../../assert'
import { mockFunction } from '../../../mock'
import { render } from '../../../render'
import { setupUser } from '../../../user-event'
import Container from '../../../../src/components/internal/container/Container'
import type {
  Container as ContainerType,
  UpdateContainerIf,
} from '../../../../src/components/types/container/types'
import { Role } from '../../../../src/components/types/user/types'
import type { GetLogin } from '../../../../src/components/types/login/types'
import { buildLogin } from '../../types/login/builders'
import { buildUser } from '../../types/user/builders'

const container: ContainerType = {
  id: '790d587e-b4e4-436f-82d3-6d450daba5d2',
  type: 'bottle',
  size: '0.25',
}

function getLogin(role: Role): GetLogin {
  return () => buildLogin({ user: buildUser({ role }) })
}

const getUpdateContainerIf: (getLogin: GetLogin) => UpdateContainerIf = (
  getLogin: GetLogin,
) => ({
  useUpdate: () => ({
    update: async () => undefined,
    isLoading: false,
  }),
  getLogin,
})

test('renders container as viewer', async () => {
  const { getByText } = render(
    <Container
      container={container}
      updateContainerIf={getUpdateContainerIf(getLogin(Role.viewer))}
    />,
  )
  getByText('bottle 0.25')
})

test('renders editable container as admin', async () => {
  const user = setupUser()
  const { getByRole, getByText } = render(
    <Container
      container={container}
      updateContainerIf={getUpdateContainerIf(getLogin(Role.admin))}
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
  const user = setupUser()
  const update = mockFunction()
  const { getByPlaceholderText, getByRole, getByText } = render(
    <Container
      container={container}
      updateContainerIf={{
        ...getUpdateContainerIf(getLogin(Role.admin)),
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
  assertDeepEqual(update.mock.calls, [
    [
      {
        ...container,
        type: 'can',
      },
    ],
  ])
  getByRole('button', { name: 'Edit' })
})
