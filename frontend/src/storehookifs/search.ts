import { useId } from 'react'
import type { SearchFieldIf } from '../core/search/types'
import type { UseDebounce } from '../core/types'
import { useDispatch, useSelector } from '../react-redux-wrapper'
import { activate, selectActiveSearch } from '../store/search/reducer'

const search: (useDebounce: UseDebounce<string>) => SearchFieldIf = (
  useDebounce: UseDebounce<string>,
) => {
  const searchFieldIf: SearchFieldIf = {
    useSearchField: () => {
      const activeSearch: string = useSelector(selectActiveSearch)
      const dispatch = useDispatch()
      const id = useId()
      const isActive = activeSearch === id
      return {
        activate: (): undefined => {
          dispatch(activate(id))
        },
        isActive,
      }
    },
    useDebounce,
  }
  return searchFieldIf
}

export default search
