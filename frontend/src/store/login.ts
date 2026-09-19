import type {
  ChangePasswordParams,
  LoginParams,
  LogoutParams,
} from './internal/login/requests'
import type { Login, PasswordChangeResult } from './internal/login/reducer'
import {
  selectLogin,
  selectPasswordChangeResult,
  success,
} from './internal/login/reducer'
import {
  useChangePasswordMutation,
  useLoginMutation,
  useLogoutMutation,
} from './internal/login/api'
import { useDispatch, useSelector } from './internal/hooks'

// The public surface of the login endpoints and of the session the store
// keeps. See store/beer.ts for why every result is built here rather than
// handed on as the mutation hook returned it.

// Logging in does not unwrap: wrong credentials are an answer, not a failure
// to talk to the backend, and the form that asked reads them from the
// mutation. isSuccess says whether there is data to make a session of.
export interface LoginResponse {
  isSuccess: boolean
  data: unknown
}

export interface LoginResult {
  login: (params: LoginParams) => Promise<LoginResponse>
  isLoading: boolean
}

export interface LogoutResult {
  logout: (params: LogoutParams) => Promise<void>
}

export interface ChangePasswordResult {
  changePassword: (params: ChangePasswordParams) => Promise<void>
  isLoading: boolean
}

export function useLogin(): LoginResult {
  const [login, { isLoading }] = useLoginMutation()
  return {
    login: async (params: LoginParams): Promise<LoginResponse> => {
      const result = await login(params)
      if ('data' in result) {
        return { isSuccess: true, data: result.data }
      }
      return { isSuccess: false, data: undefined }
    },
    isLoading,
  }
}

export function useLogout(): LogoutResult {
  const [logout] = useLogoutMutation()
  return {
    logout: async (params: LogoutParams): Promise<void> => {
      await logout(params)
    },
  }
}

export function useChangePassword(): ChangePasswordResult {
  const [changePassword, { isLoading }] = useChangePasswordMutation()
  return {
    changePassword: async (params: ChangePasswordParams): Promise<void> => {
      await changePassword(params)
    },
    isLoading,
  }
}

// The stored session is given out as unknown. It is restored from
// localStorage at startup, where anything at all may be sitting, so what the
// store holds is no more trustworthy than a response and is validated the
// same way.
export function useStoredLogin(): unknown {
  return useSelector(selectLogin)
}

export function useSaveLogin(): (login: Login) => void {
  const dispatch = useDispatch()
  return (login: Login): void => {
    dispatch(success(login))
  }
}

export function usePasswordChangeResult(): PasswordChangeResult {
  return useSelector(selectPasswordChangeResult)
}
