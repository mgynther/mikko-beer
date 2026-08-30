import type { GetLogin } from '../login/types'

export interface ContainerRequest {
  type: string
  size: string
}

export interface Container {
  id: string
  type: string
  size: string
}

export interface ContainerList {
  containers: Container[]
}

export interface CreateContainerIf {
  useCreate: () => {
    create: (container: ContainerRequest) => Promise<Container>
    isLoading: boolean
  }
}

export interface ListContainersData {
  data: ContainerList | undefined
  isLoading: boolean
}

export interface ListContainersIf {
  useList: () => ListContainersData
}

type UseUpdateContainer = () => {
  update: (container: Container) => Promise<void>
  isLoading: boolean
}

export interface UpdateContainerHookIf {
  useUpdate: UseUpdateContainer
}

export interface UpdateContainerIf {
  useUpdate: UseUpdateContainer
  getLogin: GetLogin
}
