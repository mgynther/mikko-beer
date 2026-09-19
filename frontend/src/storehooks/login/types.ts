import type { User } from '../user/types'

// The shapes these hooks work on and the validators they are given, declared
// here rather than imported from types/. See the comment in
// storehooks/style/types.ts.
export interface Login {
  authToken: string
  refreshToken: string
  user: User | undefined
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

export interface ChangePasswordParams {
  userId: string
  body: {
    oldPassword: string
    newPassword: string
  }
}

export type PasswordChangeResult = 'ERROR' | 'SUCCESS' | 'UNDEFINED'

export type GetLogin = () => Login

export type GetPasswordChangeResult = () => PasswordChangeResult

// The store functions these hooks are given. See the comment in
// storehooks/brewery/types.ts.
export interface LoginResponse {
  isSuccess: boolean
  data: unknown
}

export type UseLogin = () => {
  login: (params: LoginParams) => Promise<LoginResponse>
  isLoading: boolean
}

export type UseLogout = () => {
  logout: (params: LogoutParams) => Promise<void>
}

export type UseChangePassword = () => {
  changePassword: (params: ChangePasswordParams) => Promise<void>
  isLoading: boolean
}

export type UseStoredLogin = () => unknown

export type UseSaveLogin = () => (login: Login) => void

export type UsePasswordChangeResult = () => PasswordChangeResult

export type ValidateLogin = (result: unknown) => Login

export interface LoginHookIf {
  useLogin: () => {
    login: (login: LoginParams) => Promise<void>
    isLoading: boolean
  }
}

export interface LogoutHookIf {
  useLogout: () => {
    logout: (params: LogoutParams) => Promise<void>
  }
}

export interface ChangePasswordHookIf {
  useChangePassword: () => {
    changePassword: (params: ChangePasswordParams) => Promise<void>
    isLoading: boolean
  }
  useGetPasswordChangeResult: () => {
    getResult: GetPasswordChangeResult
  }
}
