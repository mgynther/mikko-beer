import { useState } from 'react'

import { useParams } from 'react-router-dom'

import {
  type Style as StyleType,
  type StyleWithParentIds
} from '../../store/style/types'

import { useGetStyleQuery } from '../../store/style/api'
import { useListReviewsByStyleQuery } from '../../store/review/api'
import {
  type ReviewSorting,
  type ReviewSortingOrder
} from '../../store/review/types'
import { useListStoragesByStyleQuery } from '../../store/storage/api'
import { type ListDirection } from '../../store/types'

import { EditableMode } from '../common/EditableMode'
import EditButton from '../common/EditButton'

import LoadingIndicator from '../common/LoadingIndicator'
import ReviewList from '../review/ReviewList'
import Stats from '../stats/Stats'
import StorageList from '../storage/StorageList'

import StyleLinks from './StyleLinks'
import UpdateStyle from './UpdateStyle'

import '../common/FlexRow.css'

import './Style.css'
import { type ReviewContainerIf } from '../../core/review/types'

function NotFound (): JSX.Element {
  return <div>Not found</div>
}

interface NoLinksProps {
  styles: StyleType[]
}

function NoLinks (props: NoLinksProps): JSX.Element | null {
  if (props.styles.length > 0) return null
  return <>-</>
}

interface Props {
  reviewContainerIf: ReviewContainerIf
}

function Style (props: Props): JSX.Element {
  const { styleId } = useParams()
  const [order, doSetOrder] = useState<ReviewSortingOrder>('brewery_name')
  const [direction, doSetDirection] = useState<ListDirection>('asc')
  const [mode, setMode] = useState(EditableMode.View)
  const [initialStyle, setInitialStyle] =
    useState<StyleWithParentIds | undefined>(undefined)
  if (styleId === undefined) {
    throw new Error('Style component without styleId. Should not happen.')
  }
  const { data: styleData, isLoading } = useGetStyleQuery(styleId)
  const { data: reviewData, isLoading: isLoadingReviews } =
    useListReviewsByStyleQuery({
      id: styleId,
      sorting: {
        order,
        direction
      }
    })
  const { data: storageData } = useListStoragesByStyleQuery(styleId)
  if (isLoading) return <LoadingIndicator isLoading={true} />
  if (styleData?.style === undefined) return <NotFound />
  const style = styleData.style
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
            initialStyle={initialStyle}
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
      <Stats breweryId={undefined} styleId={styleId} />
      {(storageData?.storages ?? []).length > 0 && (
        <StorageList
          isLoading={isLoadingReviews}
          isTitleVisible={true}
          storages={storageData?.storages ?? []}
        />
      )}
      <ReviewList
        reviewContainerIf={props.reviewContainerIf}
        isLoading={isLoadingReviews}
        isTitleVisible={true}
        reviews={reviewData?.reviews ?? []}
        sorting={reviewData?.sorting}
        setSorting={(sorting: ReviewSorting) => {
          if (order !== sorting.order) {
            doSetOrder(sorting.order)
          }
          if (direction !== sorting.direction) {
            doSetDirection(sorting.direction)
          }
        }}
        supportedSorting={['beer_name', 'brewery_name', 'rating', 'time']}
        onChanged={() => {}}
      />
    </>
  )
}

export default Style
