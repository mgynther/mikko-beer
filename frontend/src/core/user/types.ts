export interface User {
  id: string
  username: string
  role: string
}

export enum Role {
  admin = 'admin',
  viewer = 'viewer',
}

export interface UserList {
  users: User[]
}
