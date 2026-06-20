import { useId } from 'react'
import type { SearchFieldHookIf } from '../core/search/types'
import { useDispatch, useSelector } from '../react-redux-wrapper'
import { activate, selectActiveSearch } from '../store/search/reducer'

const searchField: () => SearchFieldHookIf = () => {
  const searchFieldIf: SearchFieldHookIf = {
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
  }
  return searchFieldIf
}

export default searchField
