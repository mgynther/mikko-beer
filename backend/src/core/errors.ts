export type AuthenticationErrors =
  | 'NoUserIdParameter'
  | 'InvalidAuthorizationHeader'
  | 'InvalidAuthToken'
  | 'ExpiredAuthToken'
  | 'Forbidden'
  | 'UserMismatch'
  | 'UserOrRefreshTokenNotFound'

export type BeerApiErrors =
  | 'InvalidBeer'
  | 'InvalidBeerId'
  | 'BeerNotFound'

export type BreweryApiErrors =
  | 'InvalidBrewery'
  | 'InvalidBreweryId'
  | 'BreweryNotFound'

export type ContainerApiErrors =
  | 'InvalidContainer'
  | 'InvalidContainerId'
  | 'ContainerNotFound'

export type ReviewApiErrors =
  | 'InvalidReview'
  | 'InvalidReviewId'
  | 'InvalidReviewListQuery'
  | 'ReviewNotFound'

export type StatsApiErrors =
  | 'InvalidBreweryStatsQuery'
  | 'InvalidStyleStatsQuery'
  | 'InvalidStatsBreweryAndStyleFilter'

export type StorageApiErrors =
  | 'InvalidStorage'
  | 'InvalidStorageId'
  | 'StorageNotFound'

export type StyleApiErrors =
  | 'CyclicStyleRelationship'
  | 'InvalidStyle'
  | 'InvalidStyleId'
  | 'StyleNotFound'

export type UserApiErrors =
  | 'InvalidUser'
  | 'UserNotFound'

export type SignInMethodApiErros =
  | 'InvalidPasswordChange'
  | 'InvalidSignInMethod'
  | 'UserAlreadyHasSignInMethod'
  | 'PasswordTooWeak'
  | 'PasswordTooLong'
  | 'InvalidCredentials'
  | 'InvalidRefreshToken'
  | 'RefreshTokenUserIdMismatch'

export type ErrorCode =
  | 'UnknownError'
  | 'InvalidPagination'
  | 'InvalidSearch'
  | AuthenticationErrors
  | BeerApiErrors
  | BreweryApiErrors
  | ContainerApiErrors
  | ReviewApiErrors
  | StatsApiErrors
  | StorageApiErrors
  | StyleApiErrors
  | UserApiErrors
  | SignInMethodApiErros

export type ErrorStatus = 400 | 401 | 403 | 404 | 409 | 500

export class ControllerError extends Error {
  readonly status: ErrorStatus
  readonly code: ErrorCode
  readonly data?: any

  constructor (
    status: ErrorStatus,
    code: ErrorCode,
    message: string,
    data?: any
  ) {
    super(message)
    this.status = status
    this.code = code
    this.data = data
  }

  toJSON (): Record<string, unknown> {
    return {
      error: { code: this.code, message: this.message }
    }
  }
}

export class UserNotFoundError extends Error {}
