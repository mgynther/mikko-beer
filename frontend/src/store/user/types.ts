export interface User {
  id: string
  username: string
  role: string
}

export interface UserList {
  users: User[]
}

export enum UserTags {
  User = 'User'
}

export function userTagTypes (): string[] {
  return [UserTags.User]
}
