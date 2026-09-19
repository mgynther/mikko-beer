// The role is a string as far as the request is concerned. The caller's Role
// is a string enum and therefore satisfies it, and the store has no reason to
// know which roles exist.
export interface CreateUserRequest {
  user: {
    role: string
  }
  passwordSignInMethod: {
    username: string
    password: string
  }
}
