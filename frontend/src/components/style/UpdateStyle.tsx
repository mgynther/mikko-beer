import { useEffect, useState } from 'react'

import { useGetStyleQuery, useUpdateStyleMutation } from '../../store/style/api'
import { type StyleWithParentIds } from '../../store/style/types'

import EditActions from '../common/EditActions'
import LoadingIndicator from '../common/LoadingIndicator'

import StyleEditor from './StyleEditor'

interface Props {
  initialStyle: StyleWithParentIds
  onCancel: () => void
  onSaved: () => void
}

function UpdateStyle (props: Props): JSX.Element {
  const { data: styleWithParents } = useGetStyleQuery(props.initialStyle.id)
  const [newStyle, setNewStyle] =
    useState<StyleWithParentIds | undefined>(undefined)
  const [updateStyle, { isError, isLoading, isSuccess }] =
    useUpdateStyleMutation()
  const onSaved = props.onSaved

  useEffect(() => {
    if (isSuccess) {
      onSaved()
    }
  }, [isSuccess, onSaved])

  async function update (): Promise<void> {
    if (newStyle === undefined) {
      throw new Error('style must not be undefined when updating')
    }
    try {
      await updateStyle({ ...newStyle }).unwrap()
    } catch (e) {
      console.warn('Failed to update style', e)
    }
  }
  return (
    <>
      {styleWithParents === undefined && <LoadingIndicator isLoading={true} />}
      {styleWithParents !== undefined &&
        <StyleEditor
          initialStyle={styleWithParents.style}
          hasError={isError}
          onChange={(style: StyleWithParentIds | undefined) => {
            setNewStyle(style)
          }}
        />
      }
      <EditActions
        isSaveDisabled={newStyle === undefined}
        isSaving={isLoading}
        onCancel={() => {
          setNewStyle(undefined)
          props.onCancel()
        }}
        onSave={() => { void update() }}
      />
    </>
  )
}

export default UpdateStyle
