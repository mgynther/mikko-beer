import { ajv } from '../../util/ajv'

export type SignInMethod = PasswordSignInMethod

export interface PasswordSignInMethod {
  username: string
  password: string
}

export const validatePasswordSignInMethod = ajv.compile<PasswordSignInMethod>({
  type: 'object',
  required: ['username', 'password'],
  properties: {
    username: {
      type: 'string'
    },
    password: {
      type: 'string'
    }
  }
})
