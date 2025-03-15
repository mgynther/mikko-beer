import React, { useState } from 'react'

import type { ParamsIf } from '../util'

import type {
  GetStyleIf,
  Style as StyleType,
  StyleWithParentIds,
  UpdateStyleIf
} from '../../core/style/types'

import type { SearchIf } from '../../core/search/types'
import type { StatsIf } from '../../core/stats/types'
import type { ListReviewsByIf, ReviewIf } from '../../core/review/types'
import type { ListStoragesByIf } from '../../core/storage/types'

import { EditableMode } from '../common/EditableMode'
import EditButton from '../common/EditButton'

import LoadingIndicator from '../common/LoadingIndicator'
import Stats from '../stats/Stats'
import StorageList from '../storage/StorageList'

import StyleLinks from './StyleLinks'
import UpdateStyle from './UpdateStyle'

import '../common/FlexRow.css'
import NotFound from '../common/NotFound'
import ReviewsBy from '../review/ReviewsBy'

import './Style.css'

interface NoLinksProps {
  styles: StyleType[]
}

function NoLinks (props: NoLinksProps): React.JSX.Element | null {
  if (props.styles.length > 0) return null
  return <>-</>
}

interface Props {
  listReviewsByStyleIf: ListReviewsByIf
  listStoragesByStyleIf: ListStoragesByIf
  getStyleIf: GetStyleIf
  paramsIf: ParamsIf
  reviewIf: ReviewIf
  searchIf: SearchIf
  statsIf: StatsIf
  updateStyleIf: UpdateStyleIf
}

function Style (props: Props): React.JSX.Element {
  const { styleId } = props.paramsIf.useParams()
  const [mode, setMode] = useState(EditableMode.View)
  const [initialStyle, setInitialStyle] =
    useState<StyleWithParentIds | undefined>(undefined)
  if (styleId === undefined) {
    throw new Error('Style component without styleId. Should not happen.')
  }
  const { style, isLoading } = props.getStyleIf.useGet(styleId)
  const { storages, isLoading: isLoadingStorages } =
    props.listStoragesByStyleIf.useList(styleId)
  if (isLoading) return <LoadingIndicator isLoading={true} />
  if (style === undefined) return <NotFound />
  return (
    <>
      {mode === EditableMode.View && (
        <>
          <div className='FlexRow'>
            <div>
              <h3>{ style.name }</h3>
            </div>
            <div>
              <EditButton
                disabled={false}
                getLogin={props.reviewIf.login}
                onClick={() => {
                  setMode(EditableMode.Edit)
                  setInitialStyle({
                    ...style,
                    parents: style.parents.map(parent => parent.id)
                  })
                }}
              />
            </div>
          </div>
          <div className='StyleInfo'>
            <h5>Parents</h5>
            <div>
              <StyleLinks styles={style.parents} />
              <NoLinks styles={style.parents} />
            </div>
          </div>
          <div className='StyleInfo'>
            <h5>Children</h5>
            <div>
              <StyleLinks styles={style.children} />
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
              props.reviewIf.update.selectBeerIf.create.editBeerIf.selectStyleIf
                .list
            }
            updateStyleIf={props.updateStyleIf}
            onCancel={() => {
              setInitialStyle(undefined)
              setMode(EditableMode.View)
            }}
            onSaved={() => {
              setMode(EditableMode.View)
            }}
            searchIf={props.searchIf}
          />
        </div>
      )}
      <Stats
        statsIf={props.statsIf}
        breweryId={undefined}
        locationId={undefined}
        paramsIf={props.paramsIf}
        styleId={styleId}
      />
      {(storages?.storages ?? []).length > 0 && (
        <StorageList
          deleteStorageIf={props.listStoragesByStyleIf.delete}
          getLogin={props.reviewIf.login}
          isLoading={isLoadingStorages}
          isTitleVisible={true}
          storages={storages?.storages ?? []}
        />
      )}
      <ReviewsBy
        id={styleId}
        listReviewsByIf={props.listReviewsByStyleIf}
        reviewIf={props.reviewIf}
        searchIf={props.searchIf}
      />
    </>
  )
}

export default Style
