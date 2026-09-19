import { activate, selectActiveSearch } from './internal/search/reducer'
import { useDispatch, useSelector } from './internal/hooks'

// Which search field is the active one is state and nothing else, see
// store/theme.ts. What it needs from React, an id that is unique per field,
// arrives as a function rather than as an import: useId belongs to the layer
// that may use React, and this one may not.
export type UseId = () => string

export interface SearchField {
  activate: () => void
  isActive: boolean
}

export interface SearchFieldHookIf {
  useSearchField: () => SearchField
}

const searchField: (useId: UseId) => SearchFieldHookIf = (useId) => {
  const searchFieldIf: SearchFieldHookIf = {
    useSearchField: () => {
      const activeSearch: string = useSelector(selectActiveSearch)
      const dispatch = useDispatch()
      const id = useId()
      return {
        activate: (): void => {
          dispatch(activate(id))
        },
        isActive: activeSearch === id,
      }
    },
  }
  return searchFieldIf
}

export default searchField
