import { test } from '../../../test'
import { assertDeepEqual, assertEqual } from '../../../assert'
import { mockFunction } from '../../../mock'
import { render } from '../../../render'
import { setupUser } from '../../../user-event'
import CreateContainer from '../../../../src/components/internal/container/CreateContainer'
import type {
  Container,
  ContainerRequest,
} from '../../../../src/components/types/container/types'
import { loadingIndicatorText } from '../../../../src/components/internal/common/LoadingIndicator'
import { dontCall } from '../../../dont-call'

const id = 'bbf9a644-74ad-4947-8335-ff1464f97a20'
const sizePlaceholder = 'Size, for example 0.25'
const typePlaceholder = 'Type'

test('creates container', async () => {
  const user = setupUser()
  const selectContainer = mockFunction()
  const { getByPlaceholderText, getByRole } = render(
    <CreateContainer
      select={selectContainer}
      createContainerIf={{
        useCreate: () => ({
          create: async (container: ContainerRequest): Promise<Container> => ({
            ...container,
            id,
          }),
          isLoading: false,
        }),
      }}
    />,
  )
  const createButton = getByRole('button', { name: 'Create' })
  const typeInput = getByPlaceholderText(typePlaceholder)
  await user.type(typeInput, 'Bottle')
  const sizeInput = getByPlaceholderText(sizePlaceholder)
  assertEqual(createButton.hasAttribute('disabled'), true)
  await user.type(sizeInput, '0.33')
  assertEqual(createButton.hasAttribute('disabled'), false)
  await user.click(createButton)
  const createCalls = selectContainer.mock.calls
  assertDeepEqual(createCalls, [
    [
      {
        id,
        type: 'Bottle',
        size: '0.33',
      },
    ],
  ])
})

test('render loading', async () => {
  const selectContainer = mockFunction()
  const { getByText } = render(
    <CreateContainer
      select={selectContainer}
      createContainerIf={{
        useCreate: () => ({
          create: dontCall,
          isLoading: true,
        }),
      }}
    />,
  )
  getByText(loadingIndicatorText)
})
