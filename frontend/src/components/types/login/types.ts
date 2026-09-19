import type { User } from '../user/types'

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

export type PasswordChangeResult = 'ERROR' | 'SUCCESS' | 'UNDEFINED'

export interface LoginIf {
  useLogin: () => {
    login: (login: LoginParams) => Promise<void>
    isLoading: boolean
  }
}

export interface LogoutIf {
  useLogout: () => {
    logout: (params: LogoutParams) => Promise<void>
  }
}

export type GetLogin = () => Login

type GetPasswordChangeResult = () => PasswordChangeResult

interface ChangePasswordParams {
  userId: string
  body: {
    oldPassword: string
    newPassword: string
  }
}

type UseChangePassword = () => {
  changePassword: (params: ChangePasswordParams) => Promise<void>
  isLoading: boolean
}

type UseGetPasswordChangeResult = () => {
  getResult: GetPasswordChangeResult
}

export interface ChangePasswordIf {
  useChangePassword: UseChangePassword
  useGetPasswordChangeResult: UseGetPasswordChangeResult
  getLogin: GetLogin
}
