export type LockId = (id: string) => Promise<string | undefined>
export type LockIds = (ids: string[]) => Promise<string[]>
