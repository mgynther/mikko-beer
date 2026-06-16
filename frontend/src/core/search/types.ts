import type { UseDebounce } from '../types'

export interface SearchFieldIf {
  useSearchField: () => {
    activate: () => void
    isActive: boolean
  }
  useDebounce: UseDebounce<string>
}
