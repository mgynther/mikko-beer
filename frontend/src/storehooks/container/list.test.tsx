import { expect, test, vitest } from 'vitest'
import { render } from '@testing-library/react'

import listContainers from './list'
import type {
  ContainerList,
  UseListContainers,
  ValidateContainerListOrUndefined,
} from './types'

// Stubs for the store function and the validator, for the reason given in
// storehooks/brewery/get.test.tsx.
const validatedContainerList: ContainerList = {
  containers: [
    {
      id: 'a8c0f5a1-2b0f-4f0e-8d1e-66a1d5f2b3c4',
      type: 'validated',
      size: '0.75',
    },
  ],
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
  const onValidate = vitest.fn()

  const { getByText } = render(
    <Helper data={listed} isLoading={false} onValidate={onValidate} />,
  )

  const [container] = validatedContainerList.containers
  expect(getByText(`${container.type} ${container.size}`)).toBeDefined()
  expect(getByText('Not loading')).toBeDefined()
  expect(onValidate).toHaveBeenCalledWith(listed)
})

test('list containers that have not arrived', () => {
  const { getByText } = render(
    <Helper data={undefined} isLoading={true} onValidate={() => undefined} />,
  )

  expect(getByText('No containers')).toBeDefined()
  expect(getByText('Loading')).toBeDefined()
})
