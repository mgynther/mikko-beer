import { test } from '../../test'
import { assertCalledWith, assertDefined } from '../../assert'
import { mockFunction } from '../../mock'
import { render } from '../../render'

import listContainers from '../../../src/storehooks/container/list'
import type {
  ContainerList,
  UseListContainers,
  ValidateContainerListOrUndefined,
} from '../../../src/storehooks/container/types'
import { buildContainer } from './builders'

// Stubs for the store function and the validator, for the reason given in
// storehooks/brewery/get.test.tsx.
const validatedContainerList: ContainerList = {
  containers: [buildContainer({ type: 'validated', size: '0.75' })],
}

const listed = { containers: [{ id: 'listed', type: 'can', size: '0.44' }] }

interface HelperProps {
  data: unknown
  isLoading: boolean
  onValidate: (result: unknown) => void
}

function Helper(props: HelperProps): React.JSX.Element {
  const useStoreList: UseListContainers = () => ({
    data: props.data,
    isLoading: props.isLoading,
  })
  const validate: ValidateContainerListOrUndefined = (result: unknown) => {
    props.onValidate(result)
    return result === undefined ? undefined : validatedContainerList
  }
  const { data, isLoading } = listContainers(useStoreList, validate).useList()
  return (
    <div>
      <div>{isLoading ? 'Loading' : 'Not loading'}</div>
      {data === undefined && <div>No containers</div>}
      {data?.containers.map((container) => (
        <div key={container.id}>
          {container.type} {container.size}
        </div>
      ))}
    </div>
  )
}

test('list containers', () => {
  const onValidate = mockFunction()

  const { getByText } = render(
    <Helper data={listed} isLoading={false} onValidate={onValidate} />,
  )

  const [container] = validatedContainerList.containers
  assertDefined(getByText(`${container.type} ${container.size}`))
  assertDefined(getByText('Not loading'))
  assertCalledWith(onValidate, [listed])
})

test('list containers that have not arrived', () => {
  const { getByText } = render(
    <Helper data={undefined} isLoading={true} onValidate={() => undefined} />,
  )

  assertDefined(getByText('No containers'))
  assertDefined(getByText('Loading'))
})
