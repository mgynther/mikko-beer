import { RefreshTokenTable } from './authentication/refresh-token.table'
import { PasswordSignInMethodTable } from './user/sign-in-method/password-sign-in-method.table'
import { SignInMethodTable } from './user/sign-in-method/sign-in-method.table'
import { BreweryTable } from './brewery/brewery.table'
import { UserTable } from './user/user.table'

export interface Database {
  brewery: BreweryTable
  user: UserTable
  refresh_token: RefreshTokenTable
  sign_in_method: SignInMethodTable
  password_sign_in_method: PasswordSignInMethodTable
}
