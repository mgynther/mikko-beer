export interface ChangePasswordParams {
  userId: string
  body: {
    oldPassword: string
    newPassword: string
  }
}

export interface LoginParams {
  username: string
  password: string
}

export interface LogoutParams {
  userId: string
  body: {
    refreshToken: string
  }
}

export enum LoginTags {
  Login = 'Login'
}

export function loginTagTypes (): string[] {
  return [LoginTags.Login]
}
