import { UseDebounce } from "../types"

export interface SearchIf {
  useSearch: () => {
    activate: () => void
    isActive: boolean
  }
  useDebounce: UseDebounce
}
