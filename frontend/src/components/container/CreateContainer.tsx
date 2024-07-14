import { useState } from 'react'

import {
  type Container,
  type CreateContainerIf
} from '../../core/container/types'

import LoadingIndicator from '../common/LoadingIndicator'

import ContainerEditor from './ContainerEditor'

export interface Props {
  select: (container: Container) => void
  createContainerIf: CreateContainerIf
}

function CreateContainer (props: Props): JSX.Element {
  const { create, isLoading } = props.createContainerIf.useCreate()
  const [container, setContainer] = useState<Container | undefined>(undefined)
  const [initialContainer] = useState<Container>({
    id: 'notused',
    type: '',
    size: ''
  })

  async function doCreate (): Promise<void> {
    if (container === undefined) {
      throw new Error('container must not be undefined')
    }
    try {
      const result = await create({
        type: container.type.trim(),
        size: container.size.trim()
      })
      props.select(result)
    } catch (e) {
      console.warn('Failed to create container', e)
    }
  }

  return (
    <>
      <ContainerEditor
        initialContainer={initialContainer}
        onChange={(container: Container | undefined) => {
          setContainer(container)
        }}
      />
      <button
        disabled={container === undefined}
        onClick={() => { void doCreate() }}
      >
        Create
      </button>
      {isLoading && <LoadingIndicator isLoading={isLoading} />}
    </>
  )
}

export default CreateContainer
