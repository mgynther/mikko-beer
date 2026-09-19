// The shapes these hooks work on and the validators they are given, declared
// here rather than imported from types/. See the comment in
// storehooks/style/types.ts.
export interface Container {
  id: string
  type: string
  size: string
}

export interface ContainerList {
  containers: Container[]
}

export interface ContainerRequest {
  type: string
  size: string
}

// The store functions these hooks are given. See the comment in
// storehooks/brewery/types.ts.
export type UseListContainers = () => {
  data: unknown
  isLoading: boolean
}

export type UseCreateContainer = () => {
  create: (container: ContainerRequest) => Promise<unknown>
  isLoading: boolean
}

export type UseUpdateContainer = () => {
  update: (container: Container) => Promise<unknown>
  isLoading: boolean
}

export type ValidateContainer = (result: unknown) => Container

export type ValidateContainerListOrUndefined = (
  result: unknown,
) => ContainerList | undefined

export interface CreateContainerHookIf {
  useCreate: () => {
    create: (container: ContainerRequest) => Promise<Container>
    isLoading: boolean
  }
}

export interface ListContainersHookIf {
  useList: () => {
    data: ContainerList | undefined
    isLoading: boolean
  }
}

export interface UpdateContainerHookIf {
  useUpdate: () => {
    update: (container: Container) => Promise<void>
    isLoading: boolean
  }
}
