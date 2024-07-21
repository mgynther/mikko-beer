export interface SearchIf {
  useSearch: () => {
    activate: () => void
    isActive: boolean
  }
}
