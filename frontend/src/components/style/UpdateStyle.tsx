import { useEffect, useState } from 'react'

import { useGetStyleQuery } from '../../store/style/api'
import type {
  ListStylesIf,
  StyleWithParentIds,
  UpdateStyleIf
} from '../../core/style/types'

import EditActions from '../common/EditActions'
import LoadingIndicator from '../common/LoadingIndicator'

import StyleEditor from './StyleEditor'

interface Props {
  listStylesIf: ListStylesIf
  updateStyleIf: UpdateStyleIf
  initialStyle: StyleWithParentIds
  onCancel: () => void
  onSaved: () => void
}

function UpdateStyle (props: Props): JSX.Element {
  const { data: styleWithParents } = useGetStyleQuery(props.initialStyle.id)
  const [newStyle, setNewStyle] =
    useState<StyleWithParentIds | undefined>(undefined)
  const { update, hasError, isLoading, isSuccess } =
    props.updateStyleIf.useUpdate()
  const onSaved = props.onSaved

  useEffect(() => {
    if (isSuccess) {
      onSaved()
    }
  }, [isSuccess, onSaved])

  async function doUpdate (): Promise<void> {
    if (newStyle === undefined) {
      throw new Error('style must not be undefined when updating')
    }
    try {
      await update({ ...newStyle })
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
          listStylesIf={props.listStylesIf}
          hasError={hasError}
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
        onSave={() => { void doUpdate() }}
      />
    </>
  )
}

export default UpdateStyle
