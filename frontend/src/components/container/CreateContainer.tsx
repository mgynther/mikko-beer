import React, { useState } from 'react'

import type {
  Container,
  CreateContainerIf
} from '../../core/container/types'

import Button from '../common/Button'
import LoadingIndicator from '../common/LoadingIndicator'

import ContainerEditor from './ContainerEditor'

export interface Props {
  select: (container: Container) => void
  createContainerIf: CreateContainerIf
}

function CreateContainer (props: Props): React.JSX.Element {
  const { create, isLoading } = props.createContainerIf.useCreate()
  const [container, setContainer] = useState<Container | undefined>(undefined)
  const [initialContainer] = useState<Container>({
    id: 'notused',
    type: '',
    size: ''
  })

  async function doCreate (container: Container): Promise<void> {
    const result = await create({
      type: container.type.trim(),
      size: container.size.trim()
    })
    props.select(result)
  }

  return (
    <>
      <ContainerEditor
        initialContainer={initialContainer}
        onChange={(container: Container | undefined) => {
          setContainer(container)
        }}
      />
      <Button
        disabled={container === undefined}
        onClick={
          container
            ? (): void => { void doCreate(container) }
            : undefined
        }
        text='Create'
      />
      {isLoading && <LoadingIndicator isLoading={isLoading} />}
    </>
  )
}

export default CreateContainer
