type AuthenticationErrors =
  | 'NoUserIdParameter'
  | 'InvalidAuthorizationHeader'
  | 'InvalidAuthToken'
  | 'ExpiredAuthToken'
  | 'Forbidden'
  | 'UserMismatch'
  | 'UserOrRefreshTokenNotFound'

type BeerApiErrors =
  | 'InvalidBeer'
  | 'InvalidBeerId'
  | 'BeerNotFound'

type BreweryApiErrors =
  | 'InvalidBrewery'
  | 'InvalidBreweryId'
  | 'BreweryNotFound'

type ContainerApiErrors =
  | 'InvalidContainer'
  | 'InvalidContainerId'
  | 'ContainerNotFound'

type LocationApiErrors =
  | 'InvalidLocation'
  | 'InvalidLocationId'
  | 'LocationNotFound'

type ReviewApiErrors =
  | 'InvalidReview'
  | 'InvalidReviewId'
  | 'InvalidReviewListQuery'
  | 'ReviewNotFound'

type StatsApiErrors =
  | 'InvalidBreweryStatsQuery'
  | 'InvalidLocationStatsQuery'
  | 'InvalidStyleStatsQuery'
  | 'InvalidStatsIdFilter'

type StorageApiErrors =
  | 'InvalidStorage'
  | 'InvalidStorageId'
  | 'StorageNotFound'

type StyleApiErrors =
  | 'CyclicStyleRelationship'
  | 'ParentStyleNotFound'
  | 'InvalidStyle'
  | 'InvalidStyleId'
  | 'StyleNotFound'

type UserApiErrors =
  | 'InvalidUser'
  | 'InvalidUserId'
  | 'UserNotFound'

type SignInMethodApiErros =
  | 'InvalidPasswordChange'
  | 'InvalidSignInMethod'
  | 'UserAlreadyHasSignInMethod'
  | 'PasswordTooWeak'
  | 'PasswordTooLong'
  | 'InvalidCredentials'
  | 'InvalidRefreshToken'
  | 'RefreshTokenUserIdMismatch'

type ErrorCode =
  | 'UnknownError'
  | 'InvalidPagination'
  | 'InvalidQuery'
  | 'InvalidSearch'
  | AuthenticationErrors
  | BeerApiErrors
  | BreweryApiErrors
  | ContainerApiErrors
  | LocationApiErrors
  | ReviewApiErrors
  | StatsApiErrors
  | StorageApiErrors
  | StyleApiErrors
  | UserApiErrors
  | SignInMethodApiErros

type ErrorStatus = 400 | 401 | 403 | 404 | 409 | 500

export class ControllerError extends Error {
  readonly status: ErrorStatus
  readonly code: ErrorCode
  readonly data?: unknown

  constructor (
    status: ErrorStatus,
    code: ErrorCode,
    message: string,
    data?: unknown
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

// Authentication
export const expiredAuthTokenError = new ControllerError(
  401,
  'ExpiredAuthToken',
  'the auth token has expired'
)

export const invalidAuthorizationHeaderError = new ControllerError(
  400,
  'InvalidAuthorizationHeader',
  'missing or invalid Authorization header'
)

export const invalidAuthTokenError = new ControllerError(
  401,
  'InvalidAuthToken',
  'invalid auth token'
)

export const noUserIdParameterError = new ControllerError(
  400,
  'NoUserIdParameter',
  'no user id parameter found in the route'
)

export const noRightsError = new ControllerError(
  403,
  'Forbidden',
  'no rights'
)

export const userMismatchError = new ControllerError(
  403,
  'UserMismatch',
  "wrong user's auth token"
)

export const userOrRefreshTokenNotFoundError = new ControllerError(
  404,
  'UserOrRefreshTokenNotFound',
  'either the user or the refresh token has been deleted'
)

// Beer
export const beerNotFoundError = (
  beerId: string
): ControllerError => new ControllerError(
  404,
  'BeerNotFound',
  `beer with id ${beerId} was not found`
)

export const invalidBeerError = new ControllerError(
  400,
  'InvalidBeer',
  'invalid beer'
)

export const invalidBeerIdError = new ControllerError(
  400,
  'InvalidBeerId',
  'invalid beer id'
)

export const referredBeerNotFoundError = new ControllerError(
  400,
  'BeerNotFound',
  'beer not found'
)

// Brewery
export const breweryNotFoundError = (
  id: string
): ControllerError => new ControllerError(
  404,
  'BreweryNotFound',
  `brewery with id ${id} was not found`
)

export const invalidBreweryError = new ControllerError(
  400,
  'InvalidBrewery',
  'invalid brewery'
)

export const invalidBreweryIdError = new ControllerError(
  400,
  'InvalidBreweryId',
  'invalid brewery id'
)

export const referredBreweryNotFoundError = new ControllerError(
  400,
  'BreweryNotFound',
  'brewery not found'
)

// Container
export const containerNotFoundError = (
  id: string
): ControllerError => new ControllerError(
  404,
  'ContainerNotFound',
  `container with id ${id} was not found`
)

export const invalidContainerError = new ControllerError(
  400,
  'InvalidContainer',
  'invalid container'
)

export const invalidContainerIdError = new ControllerError(
  400,
  'InvalidContainerId',
  'invalid container id'
)

export const referredContainerNotFoundError = new ControllerError(
  400,
  'ContainerNotFound',
  'container not found'
)

// Location
export const locationNotFoundError = (
  id: string
): ControllerError => new ControllerError(
  404,
  'LocationNotFound',
  `location with id ${id} was not found`
)

export const invalidLocationError = new ControllerError(
  400,
  'InvalidLocation',
  'invalid location'
)

export const invalidLocationIdError = new ControllerError(
  400,
  'InvalidLocationId',
  'invalid location id'
)

// Pagination
export const invalidPaginationError = new ControllerError(
  400,
  'InvalidPagination',
  'invalid pagination'
)

// Query
export const invalidQueryError = new ControllerError(
  400,
  'InvalidQuery',
  'invalid query, most likely duplicate query parameter'
)

// Review
export const invalidReviewError = new ControllerError(
  400,
  'InvalidReview',
  'invalid review'
)

export const invalidReviewIdError = new ControllerError(
  400,
  'InvalidReviewId',
  'invalid review id'
)

export const invalidReviewListQueryBeerNameError = new ControllerError(
  400,
  'InvalidReviewListQuery',
  'invalid use of beer_name order'
)

export const invalidReviewListQueryBreweryNameError = new ControllerError(
  400,
  'InvalidReviewListQuery',
  'invalid use of brewery order'
)

export const invalidReviewListQueryOrderError = new ControllerError(
  400,
  'InvalidReviewListQuery',
  'invalid review list query'
)

export const reviewNotFoundError = (
  id: string
): ControllerError => new ControllerError(
  404,
  'ReviewNotFound',
  `review with id ${id} was not found`
)

// Search
export const invalidSearchError = new ControllerError(
  400,
  'InvalidSearch',
  'invalid search'
)

// Stats
export const invalidIdFilterError = new ControllerError(
  400,
  'InvalidStatsIdFilter',
  'invalid filter with multiple of brewery, location and style'
)

export const invalidBreweryStatsQueryError = new ControllerError(
  400,
  'InvalidBreweryStatsQuery',
  'invalid brewery stats query'
)

export const invalidLocationStatsQueryError = new ControllerError(
  400,
  'InvalidLocationStatsQuery',
  'invalid location stats query'
)

export const invalidStyleStatsQueryError = new ControllerError(
  400,
  'InvalidStyleStatsQuery',
  'invalid style stats query'
)

// Storage
export const invalidStorageError = new ControllerError(
  400,
  'InvalidStorage',
  'invalid storage'
)

export const invalidStorageIdError = new ControllerError(
  400,
  'InvalidStorageId',
  'invalid storage id'
)

export const referredStorageNotFoundError = new ControllerError(
  400,
  'StorageNotFound',
  'storage not found'
)

export const storageNotFoundError = (
  id: string
): ControllerError => new ControllerError(
  404,
  'StorageNotFound',
  `storage with id ${id} was not found`
)

// Style
export const cyclicRelationshipError = new ControllerError(
  400,
  'CyclicStyleRelationship',
  'cyclic style relationships are not allowed'
)

export const invalidStyleError = new ControllerError(
  400,
  'InvalidStyle',
  'invalid style'
)

export const invalidStyleIdError = new ControllerError(
  400,
  'InvalidStyleId',
  'invalid style id'
)

export const parentStyleNotFoundError = new ControllerError(
  400,
  'ParentStyleNotFound',
  'parent style was not found'
)

export const referredStyleNotFoundError = new ControllerError(
  400,
  'StyleNotFound',
  'style not found'
)

export const styleNotFoundError = (
  id: string
): ControllerError => new ControllerError(
  404,
  'StyleNotFound',
  `style with id ${id} was not found`
)

// User
export const invalidUserError = new ControllerError(
  400,
  'InvalidUser',
  'invalid user'
)

export const invalidUserIdError = new ControllerError(
  400,
  'InvalidUserId',
  'invalid user id'
)

export const invalidUserSignInMethodError = new ControllerError(
  400,
  'InvalidUser',
  'invalid sign in method'
)

export const userNotFoundError = (
  id: string
): ControllerError => new ControllerError(
  404,
  'UserNotFound',
  `user with id ${id} was not found`
)

// User - sign in method
export const invalidCredentialsError = new ControllerError(
  401,
  'InvalidCredentials',
  'wrong username or password'
)

export const invalidCredentialsTokenError = new ControllerError(
  401,
  'InvalidCredentials',
  'invalid token'
)

export const invalidPasswordChangeError = new ControllerError(
  400,
  'InvalidPasswordChange',
  'invalid password change'
)

export const invalidSignInMethodError = new ControllerError(
  400,
  'InvalidSignInMethod',
  'invalid sign in method'
)

export const invalidRefreshTokenError = new ControllerError(
  400,
  'InvalidRefreshToken',
  'the body must contain a valid refresh token'
)

export const passwordTooLongError = new ControllerError(
  400,
  'PasswordTooLong',
  'password is too long'
)

export const passwordTooWeakError = new ControllerError(
  400,
  'PasswordTooWeak',
  'password is too weak'
)

export const userAlreadyHasSignInMethodError = new ControllerError(
  409,
  'UserAlreadyHasSignInMethod',
  'the user already has a sign in method'
)
