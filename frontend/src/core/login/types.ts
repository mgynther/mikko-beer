import type { User } from "../user/types"

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

export interface Refresh {
  authToken: string
  refreshToken: string
}

export interface Login extends Refresh {
  user: User | undefined
}

export enum PasswordChangeResult {
  ERROR = 'ERROR',
  SUCCESS = 'SUCCESS',
  UNDEFINED = 'UNDEFINED'
}

export interface LoginIf {
  useLogin: () => {
    login: (login: LoginParams) => Promise<void>
    isLoading: boolean
  }
}

export type GetLogin = () => Login
export type GetPasswordChangeResult = () => PasswordChangeResult
