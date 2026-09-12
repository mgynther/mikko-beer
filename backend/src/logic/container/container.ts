export interface Container {
  id: string
  type: string
  size: string
}

interface ContainerRequest {
  type: string
  size: string
}

export type CreateContainerRequest = ContainerRequest
export type UpdateContainerRequest = ContainerRequest

export interface ValidUpdateContainerRequest {
  id: string
  request: UpdateContainerRequest
}

export type CreateContainerValidationResult =
  | {
      errorCode: 'invalid-container'
      result: undefined
    }
  | {
      errorCode: undefined
      result: CreateContainerRequest
    }

export type ValidateCreateContainer = (
  body: unknown,
) => CreateContainerValidationResult

export type UpdateContainerValidationResult =
  | {
      errorCode: 'invalid-container' | 'invalid-container-id'
      result: undefined
    }
  | {
      errorCode: undefined
      result: ValidUpdateContainerRequest
    }

export type ValidateUpdateContainer = (
  body: unknown,
  id: string | undefined,
) => UpdateContainerValidationResult

export type ValidateContainerIdResult =
  | {
      errorCode: 'invalid-container-id'
      result: undefined
    }
  | {
      errorCode: undefined
      result: string
    }

export type ValidateContainerId = (
  id: string | undefined,
) => ValidateContainerIdResult
