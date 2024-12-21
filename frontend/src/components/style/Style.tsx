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
import type {
  ListReviewsByIf,
  ReviewIf,
  ReviewSorting,
  ReviewSortingOrder
} from '../../core/review/types'
import type { ListStoragesByIf } from '../../core/storage/types'
import type { ListDirection } from '../../core/types'

import { EditableMode } from '../common/EditableMode'
import EditButton from '../common/EditButton'

import LoadingIndicator from '../common/LoadingIndicator'
import ReviewList from '../review/ReviewList'
import Stats from '../stats/Stats'
import StorageList from '../storage/StorageList'

import StyleLinks from './StyleLinks'
import UpdateStyle from './UpdateStyle'

import '../common/FlexRow.css'
import NotFound from '../common/NotFound'

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
  const [order, doSetOrder] = useState<ReviewSortingOrder>('brewery_name')
  const [direction, doSetDirection] = useState<ListDirection>('asc')
  const [mode, setMode] = useState(EditableMode.View)
  const [initialStyle, setInitialStyle] =
    useState<StyleWithParentIds | undefined>(undefined)
  if (styleId === undefined) {
    throw new Error('Style component without styleId. Should not happen.')
  }
  const { style, isLoading } = props.getStyleIf.useGet(styleId)
  const { reviews, isLoading: isLoadingReviews } =
    props.listReviewsByStyleIf.useList({
      id: styleId,
      sorting: {
        order,
        direction
      }
    })
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
      <ReviewList
        reviewIf={props.reviewIf}
        isLoading={isLoadingReviews}
        isTitleVisible={true}
        reviews={reviews?.reviews ?? []}
        searchIf={props.searchIf}
        sorting={reviews?.sorting}
        setSorting={(sorting: ReviewSorting) => {
          if (order !== sorting.order) {
            doSetOrder(sorting.order)
          }
          if (direction !== sorting.direction) {
            doSetDirection(sorting.direction)
          }
        }}
        supportedSorting={['beer_name', 'brewery_name', 'rating', 'time']}
        onChanged={() => undefined}
      />
    </>
  )
}

export default Style
