// A storage of a test's own, standing in for localStorage so that no two
// tests share one. It has the part of the Web Storage interface the
// application uses, declared here because a helper every layer's tests share
// may import no layer.
export interface MemoryStorage {
  getItem: (key: string) => string | null
  setItem: (key: string, value: string) => void
  removeItem: (key: string) => void
}

export function createMemoryStorage(): MemoryStorage {
  const items = new Map<string, string>()
  return {
    getItem: (key: string): string | null => items.get(key) ?? null,
    setItem: (key: string, value: string): void => {
      items.set(key, value)
    },
    removeItem: (key: string): void => {
      items.delete(key)
    },
  }
}
