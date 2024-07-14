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
