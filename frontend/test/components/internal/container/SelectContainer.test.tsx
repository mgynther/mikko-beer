import { test } from '../../../test'
import { assertDeepEqual } from '../../../assert'
import { mockFunction } from '../../../mock'
import { render } from '../../../render'
import { setupUser } from '../../../user-event'
import SelectContainer from '../../../../src/components/internal/container/SelectContainer'
import type {
  Container,
  ListContainersData,
} from '../../../../src/components/types/container/types'
import type { ReviewContainerIf } from '../../../../src/components/types/review/types'
import { loadingIndicatorText } from '../../../../src/components/internal/common/LoadingIndicator'
import { dontCall } from '../../../dont-call'

const sizePlaceholder = 'Size, for example 0.25'
const typePlaceholder = 'Type'

const draftContainer: Container = {
  id: '17cc9e00-37a0-4807-9969-5730c4635a3c',
  type: 'draft',
  size: '0.33',
}

const bottleContainer: Container = {
  id: '96ba66cd-1a85-4e33-bbed-8e660da8f4d8',
  type: 'bottle',
  size: '0.33',
}

const useList = (): ListContainersData => ({
  data: {
    containers: [draftContainer, bottleContainer],
  },
  isLoading: false,
})

const dontCreateIf: ReviewContainerIf = {
  createIf: {
    useCreate: dontCall,
  },
  listIf: {
    useList,
  },
}

test('selects container', async () => {
  const user = setupUser()
  const onSelect = mockFunction<[container: Container]>()
  const { getByRole } = render(
    <SelectContainer select={onSelect} reviewContainerIf={dontCreateIf} />,
  )
  const containerSelect = getByRole('combobox')
  await user.click(containerSelect)
  const bottle = getByRole('option', { name: 'bottle 0.33' })
  assertDeepEqual(onSelect.mock.calls, [])
  await user.selectOptions(containerSelect, bottle)
  const selectCalls = onSelect.mock.calls
  assertDeepEqual(selectCalls, [[bottleContainer]])
})

test('render loading', async () => {
  const onSelect = mockFunction<[container: Container]>()
  const { getByText } = render(
    <SelectContainer
      select={onSelect}
      reviewContainerIf={{
        ...dontCreateIf,
        listIf: {
          useList: () => ({
            data: undefined,
            isLoading: true,
          }),
        },
      }}
    />,
  )
  getByText(loadingIndicatorText)
})

test('selects created container', async () => {
  const user = setupUser()
  const onSelect = mockFunction<[container: Container]>()
  const newContainer: Container = {
    id: '13d3e36c-e1db-4c6e-b4f8-d28e45209882',
    type: 'bottle',
    size: '0.50',
  }
  const { getByPlaceholderText, getByRole } = render(
    <SelectContainer
      select={onSelect}
      reviewContainerIf={{
        createIf: {
          useCreate: () => ({
            create: async (): Promise<Container> => newContainer,
            isLoading: false,
          }),
        },
        listIf: {
          useList,
        },
      }}
    />,
  )
  const createRadio = getByRole('radio', { name: 'Create' })
  await user.click(createRadio)

  const createButton = getByRole('button', { name: 'Create' })
  const typeInput = getByPlaceholderText(typePlaceholder)
  await user.type(typeInput, newContainer.type)
  const sizeInput = getByPlaceholderText(sizePlaceholder)
  await user.type(sizeInput, newContainer.size)
  await user.click(createButton)

  const selectCalls = onSelect.mock.calls
  assertDeepEqual(selectCalls, [[newContainer]])
})
