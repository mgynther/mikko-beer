import { type RefreshTokenTable } from './authentication/refresh-token.table'
import { type PasswordSignInMethodTable } from './user/sign-in-method/password-sign-in-method.table'
import { type SignInMethodTable } from './user/sign-in-method/sign-in-method.table'
import { type BreweryTable } from './brewery/brewery.table'
import { type UserTable } from './user/user.table'

export interface Database {
  brewery: BreweryTable
  user: UserTable
  refresh_token: RefreshTokenTable
  sign_in_method: SignInMethodTable
  password_sign_in_method: PasswordSignInMethodTable
}
