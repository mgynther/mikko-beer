import React, { useState } from 'react'

import type { UseUrlPathParams } from '../types/types'

import type {
  GetStyleIf,
  Style as StyleType,
  StyleWithParentIds,
  UpdateStyleIf,
} from '../types/style/types'

import type { StatsIf } from '../types/stats/types'
import type { ListReviewsByIf } from '../types/review/types'
import type { ListStoragesByIf } from '../types/storage/types'

import { EditableMode } from '../internal/common/EditableMode'
import EditButton from '../internal/common/EditButton'

import LoadingIndicator from '../internal/common/LoadingIndicator'
import Stats from '../stats/Stats'
import StorageList from '../internal/storage/StorageList'

import StyleLinks from '../internal/style/StyleLinks'
import UpdateStyle from '../internal/style/UpdateStyle'

import '../common/FlexRow.css'
import NotFound from '../internal/common/NotFound'
import ReviewsBy from '../internal/review/ReviewsBy'

import './Style.css'
import type { LinkComponent } from '../common/link'

interface NoLinksProps {
  styles: StyleType[]
}

function NoLinks(props: NoLinksProps): React.JSX.Element | null {
  if (props.styles.length > 0) return null
  return <>-</>
}

interface Props {
  linkComponent: LinkComponent
  listReviewsByStyleIf: ListReviewsByIf
  listStoragesByStyleIf: ListStoragesByIf
  getStyleIf: GetStyleIf
  useUrlPathParams: UseUrlPathParams
  statsIf: StatsIf
  updateStyleIf: UpdateStyleIf
}

function Style(props: Props): React.JSX.Element {
  const { styleId } = props.useUrlPathParams()
  const [mode, setMode] = useState(EditableMode.View)
  const [initialStyle, setInitialStyle] = useState<
    StyleWithParentIds | undefined
  >(undefined)
  if (styleId === undefined) {
    throw new Error('Style component without styleId. Should not happen.')
  }
  const { style, isLoading } = props.getStyleIf.useGet(styleId)
  const { storages, isLoading: isLoadingStorages } =
    props.listStoragesByStyleIf.useList(styleId)
  if (isLoading) return <LoadingIndicator isLoading={true} />
  if (style === undefined) return <NotFound />
  const storageItems = storages?.storages ?? []
  return (
    <>
      {mode === EditableMode.View && (
        <>
          <div className='FlexRow'>
            <div>
              <h3>{style.name}</h3>
            </div>
            <div>
              <EditButton
                disabled={false}
                getLogin={props.updateStyleIf.getLogin}
                onClick={() => {
                  setMode(EditableMode.Edit)
                  setInitialStyle({
                    ...style,
                    parents: style.parents.map((parent) => parent.id),
                  })
                }}
              />
            </div>
          </div>
          <div className='StyleInfo'>
            <h5>Parents</h5>
            <div>
              <StyleLinks
                linkComponent={props.linkComponent}
                styles={style.parents}
              />
              <NoLinks styles={style.parents} />
            </div>
          </div>
          <div className='StyleInfo'>
            <h5>Children</h5>
            <div>
              <StyleLinks
                linkComponent={props.linkComponent}
                styles={style.children}
              />
              <NoLinks styles={style.children} />
            </div>
          </div>
        </>
      )}
      {mode === EditableMode.Edit && initialStyle !== undefined && (
        <div>
          <UpdateStyle
            getStyleIf={props.getStyleIf}
            initialStyle={initialStyle}
            listStylesIf={
              props.listReviewsByStyleIf.reviewIf.update.selectBeerIf.create
                .editBeerIf.selectStyleIf.list
            }
            updateStyleHookIf={{
              useUpdate: props.updateStyleIf.useUpdate,
            }}
            onCancel={() => {
              setInitialStyle(undefined)
              setMode(EditableMode.View)
            }}
            onSaved={() => {
              setMode(EditableMode.View)
            }}
          />
        </div>
      )}
      <Stats
        linkComponent={props.linkComponent}
        statsIf={props.statsIf}
        breweryId={undefined}
        locationId={undefined}
        styleId={styleId}
      />
      {storageItems.length > 0 && (
        <StorageList
          linkComponent={props.linkComponent}
          deleteStorageIf={props.listStoragesByStyleIf.delete}
          isLoading={isLoadingStorages}
          isTitleVisible={true}
          storages={storageItems}
        />
      )}
      <ReviewsBy
        linkComponent={props.linkComponent}
        id={styleId}
        listReviewsByIf={props.listReviewsByStyleIf}
      />
    </>
  )
}

export default Style
