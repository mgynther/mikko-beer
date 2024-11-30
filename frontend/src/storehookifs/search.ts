import { useId } from "react"
import type { SearchIf } from "../core/search/types"
import type { UseDebounce } from "../core/types"
import { useDispatch, useSelector } from "../react-redux-wrapper"
import { activate, selectActiveSearch } from "../store/search/reducer"

const search: (
  useDebounce: UseDebounce
) => SearchIf = (
  useDebounce: UseDebounce
) => {
  const searchIf: SearchIf = {
    useSearch: () => {
      const activeSearch: string = useSelector(selectActiveSearch)
      const dispatch = useDispatch()
      const id = useId()
      const isActive = activeSearch === id
      return {
        activate: () => {
          dispatch(activate(id))
        },
        isActive
      }
    },
    useDebounce
  }
  return searchIf
}

export default search
