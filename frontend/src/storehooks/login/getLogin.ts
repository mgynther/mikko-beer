import type { GetLogin, Login, UseStoredLogin, ValidateLogin } from './types'

const loggedOut: Login = {
  authToken: '',
  refreshToken: '',
  user: undefined,
}

// The session is restored from localStorage at startup, where anything at all
// may be sitting, so what the store holds is validated on the way out like any
// other unknown data. A session that does not validate is not a session:
// reporting it as logged out is both true and recoverable, where throwing
// would leave a hand edited localStorage key bricking the application.
const getLogin: (
  useStoredLogin: UseStoredLogin,
  validateLogin: ValidateLogin,
) => GetLogin = (useStoredLogin, validateLogin) => {
  const get: GetLogin = () => {
    const login: unknown = useStoredLogin()
    try {
      return validateLogin(login)
    } catch {
      return loggedOut
    }
  }
  return get
}

export default getLogin
