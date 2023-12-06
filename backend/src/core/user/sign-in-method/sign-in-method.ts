import { ajv } from '../../ajv'

export type SignInMethod = PasswordSignInMethod

export interface PasswordSignInMethod {
  username: string
  password: string
}

export const validatePasswordSignInMethod = ajv.compile<PasswordSignInMethod>({
  type: 'object',
  required: ['username', 'password'],
  additionalProperties: false,
  properties: {
    username: {
      type: 'string'
    },
    password: {
      type: 'string'
    }
  }
})

export interface PasswordChange {
  oldPassword: string
  newPassword: string
}

export const validatePasswordChange = ajv.compile<PasswordChange>({
  type: 'object',
  required: ['oldPassword', 'newPassword'],
  additionalProperties: false,
  properties: {
    oldPassword: {
      type: 'string'
    },
    newPassword: {
      type: 'string'
    }
  }
})
