import { Fragment } from 'react'

import LoadingIndicator from './LoadingIndicator'

import './SearchBox.css'

export interface SearchBoxItem {
  id: string
  name: string
}

interface Props {
  currentFilter: string
  currentOptions: SearchBoxItem[]
  isLoading: boolean
  setFilter: (filter: string) => void
  select: (item: SearchBoxItem) => void
}

const maxResultCount = 10

function SearchBox (props: Props): JSX.Element {
  const visibleOptions = props.currentFilter.length === 0 ||
    props.isLoading
    ? []
    : props.currentOptions.slice(0, maxResultCount)
  const areAllShown = visibleOptions.length === props.currentOptions.length
  return (
    <div className="SearchBox">
      <label>Search:</label>{' '}
      <input
        type='text'
        value={props.currentFilter}
        onChange={e => { props.setFilter(e.target.value) }}
      />
      {!props.isLoading && props.currentFilter.length > 0 && (
        <Fragment>
          <div className="SearchResults">
            <ul>
              {visibleOptions.map(item => (
                <li
                  key={item.id}
                  onClick={() => { props.select(item) }}
                >
                  {item.name}
                </li>
              ))}
              <div className="SearchInfo">
                <hr/>
                {!areAllShown &&
                  <div>
                    There are more results. Refine search...
                  </div>
                }
                {visibleOptions.length === 0 && <div>No results</div>}
                <LoadingIndicator isLoading={props.isLoading} />
              </div>
            </ul>
          </div>
        </Fragment>
      )}
    </div>
  )
}

export default SearchBox
