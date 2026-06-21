import React, { useEffect, useState } from 'react'

import type {
  GetStyleIf,
  ListStylesIf,
  StyleWithParentIds,
  UpdateStyleHookIf,
} from '../../core/style/types'

import EditActions from '../common/EditActions'
import LoadingIndicator from '../common/LoadingIndicator'

import StyleEditor from './StyleEditor'

interface Props {
  getStyleIf: GetStyleIf
  listStylesIf: ListStylesIf
  updateStyleHookIf: UpdateStyleHookIf
  initialStyle: StyleWithParentIds
  onCancel: () => void
  onSaved: () => void
}

function UpdateStyle(props: Props): React.JSX.Element {
  const { style: styleWithParents } = props.getStyleIf.useGet(
    props.initialStyle.id,
  )
  const [newStyle, setNewStyle] = useState<StyleWithParentIds | undefined>(
    undefined,
  )
  const { update, hasError, isLoading, isSuccess } =
    props.updateStyleHookIf.useUpdate()
  const onSaved = props.onSaved

  useEffect(() => {
    if (isSuccess) {
      onSaved()
    }
  }, [isSuccess, onSaved])

  async function doUpdate(style: StyleWithParentIds): Promise<void> {
    await update({ ...style })
  }
  return (
    <>
      {styleWithParents === undefined && <LoadingIndicator isLoading={true} />}
      {styleWithParents !== undefined && (
        <StyleEditor
          initialStyle={styleWithParents}
          listStylesIf={props.listStylesIf}
          hasError={hasError}
          onChange={(style: StyleWithParentIds | undefined) => {
            setNewStyle(style)
          }}
        />
      )}
      <EditActions
        isSaveDisabled={newStyle === undefined}
        isSaving={isLoading}
        onCancel={() => {
          setNewStyle(undefined)
          props.onCancel()
        }}
        onSave={
          newStyle === undefined
            ? undefined
            : (): void => {
                void doUpdate(newStyle)
              }
        }
      />
    </>
  )
}

export default UpdateStyle
